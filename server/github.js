const axios = require('axios');

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Headers for GitHub API requests
const getHeaders = (token = null) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Auto-Commits-App'
  };
  
  // Add authorization if token is available
  if (token) {
    headers['Authorization'] = `token ${token}`;
  } else if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
};

// Fetch all public repositories for a user
const fetchUserRepositories = async (username) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos`,
      { headers: getHeaders() }
    );

    return response.data
      .filter(repo => !repo.fork) // Only include non-forked repositories
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url
      }))
      .sort((a, b) => b.stargazers_count - a.stargazers_count); // Sort by stars
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`User '${username}' not found`);
    }
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
};

// Fetch commits from a specific repository
const fetchRepositoryCommits = async (username, repository) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/commits`,
      { 
        headers: getHeaders(),
        params: {
          per_page: 100, // Get up to 100 commits
          page: 1
        }
      }
    );

    return response.data.map(commit => ({
      sha: commit.sha,
      commit: {
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        }
      },
      html_url: commit.html_url,
      author: commit.author ? {
        login: commit.author.login,
        avatar_url: commit.author.avatar_url
      } : null
    }));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Repository '${username}/${repository}' not found`);
    }
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
};

// Get repository details
const getRepositoryDetails = async (username, repository) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}`,
      { headers: getHeaders() }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      full_name: response.data.full_name,
      description: response.data.description,
      language: response.data.language,
      stargazers_count: response.data.stargazers_count,
      forks_count: response.data.forks_count,
      updated_at: response.data.updated_at,
      html_url: response.data.html_url
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Repository '${username}/${repository}' not found`);
    }
    throw new Error(`Failed to fetch repository details: ${error.message}`);
  }
};

// Create a new commit in a repository
const createCommit = async (username, repository, commitMessage, content, path = 'auto-commit.txt', token = null) => {
  try {
    // First, get the current tree SHA
    const repoResponse = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}`,
      { headers: getHeaders(token) }
    );
    
    const defaultBranch = repoResponse.data.default_branch;
    
    // Check if repository is empty
    const commitsResponse = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/commits`,
      { 
        headers: getHeaders(token),
        params: { per_page: 1 }
      }
    );
    
    let latestCommitSha = null;
    let baseTreeSha = null;
    
    if (commitsResponse.data.length > 0) {
      // Repository has commits, get the latest commit SHA
      const branchResponse = await axios.get(
        `${GITHUB_API_BASE}/repos/${username}/${repository}/branches/${defaultBranch}`,
        { headers: getHeaders(token) }
      );
      
      latestCommitSha = branchResponse.data.commit.sha;
      baseTreeSha = branchResponse.data.commit.commit.tree.sha;
    } else {
      // Empty repository, we'll create the first commit
      console.log('Repository is empty, creating first commit');
    }
    
    // Create a blob with the content
    const blobResponse = await axios.post(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/git/blobs`,
      {
        content: content,
        encoding: 'utf-8'
      },
      { headers: getHeaders(token) }
    );
    
    const blobSha = blobResponse.data.sha;
    
    // Create a new tree
    const treeData = {
      tree: [
        {
          path: path,
          mode: '100644',
          type: 'blob',
          sha: blobSha
        }
      ]
    };
    
    // If repository has existing commits, use the base tree
    if (baseTreeSha) {
      treeData.base_tree = baseTreeSha;
    }
    
    const treeResponse = await axios.post(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/git/trees`,
      treeData,
      { headers: getHeaders(token) }
    );
    
    const treeSha = treeResponse.data.sha;
    
    // Create a new commit
    const commitData = {
      message: commitMessage,
      tree: treeSha
    };
    
    // If repository has existing commits, add the parent
    if (latestCommitSha) {
      commitData.parents = [latestCommitSha];
    }
    
    const commitResponse = await axios.post(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/git/commits`,
      commitData,
      { headers: getHeaders(token) }
    );
    
    const commitSha = commitResponse.data.sha;
    
    // Update the reference (branch)
    await axios.patch(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/git/refs/heads/${defaultBranch}`,
      {
        sha: commitSha
      },
      { headers: getHeaders(token) }
    );
    
    return {
      sha: commitSha,
      message: commitMessage,
      url: commitResponse.data.html_url
    };
  } catch (error) {
    console.error('Commit creation error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 401) {
      throw new Error('GitHub authentication failed. Please check your token.');
    }
    if (error.response && error.response.status === 403) {
      throw new Error('Access denied. Make sure you have write access to this repository.');
    }
    if (error.response && error.response.status === 422) {
      throw new Error('Failed to create commit. This might be due to an empty repository or invalid commit data. Try selecting a repository with existing commits.');
    }
    throw new Error(`Failed to create commit: ${error.message}`);
  }
};

// Generate random commit messages
const generateCommitMessages = () => {
  const messages = [
    'Update documentation',
    'Fix minor bugs',
    'Improve code structure',
    'Add new features',
    'Optimize performance',
    'Refactor code',
    'Update dependencies',
    'Fix typo',
    'Add comments',
    'Clean up code',
    'Update README',
    'Fix formatting',
    'Add tests',
    'Update configuration',
    'Improve error handling'
  ];
  
  return messages.sort(() => 0.5 - Math.random()).slice(0, 5);
};

// Create multiple commits in a repository
const createMultipleCommits = async (username, repository, count = 5, token = null) => {
  const commits = [];
  const messages = generateCommitMessages();
  
  for (let i = 0; i < count; i++) {
    try {
      const message = messages[i] || `Auto commit ${i + 1}`;
      const content = `Auto-generated content for commit ${i + 1}\nGenerated at: ${new Date().toISOString()}`;
      const path = `auto-commits/commit-${i + 1}.txt`;
      
      console.log(`Creating commit ${i + 1}/${count}: ${message}`);
      const commit = await createCommit(username, repository, message, content, path, token);
      commits.push(commit);
      
      console.log(`Successfully created commit ${i + 1}: ${commit.sha}`);
      
      // Add a small delay between commits to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Failed to create commit ${i + 1}:`, error.message);
      
      // If it's the first commit and it fails, provide specific guidance
      if (i === 0) {
        throw new Error(`Failed to create first commit: ${error.message}\n\nPossible solutions:\n1. Make sure the repository has at least one commit\n2. Try selecting a different repository with existing commits\n3. Check if you have write access to this repository`);
      }
      
      // For other commits, continue with what we have
      console.log(`Stopping commit creation after ${commits.length} successful commits`);
      break;
    }
  }
  
  if (commits.length === 0) {
    throw new Error('No commits were created. Please try with a repository that has existing commits.');
  }
  
  return commits;
};

module.exports = {
  fetchUserRepositories,
  fetchRepositoryCommits,
  getRepositoryDetails,
  createCommit,
  createMultipleCommits
}; 