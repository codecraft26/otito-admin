// src/data/adminApi.ts

const API_BASE ="http://localhost:5001";


// Test token validity
export async function validateToken(token: string) {
  try {
    const res = await fetch(`${API_BASE}/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log('Token validation:', res.status, data);
    return { valid: res.ok, status: res.status, data };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error };
  }
}

// Manual token test function - call this from browser console

export async function superadminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function createAdmin(token: string, data: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/superadmin/admin/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAdmin(token: string, id: string, data: { name?: string; email?: string; password?: string }) {
  const res = await fetch(`${API_BASE}/api/superadmin/admin/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateConfig(token: string, data: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/admin/config/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createConfig(token: string, data: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/admin/config/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function generateEnglishNews(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/news/generate-english`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function generateHindiNews(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/news/generate-hindi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function updateArticle(token: string, data: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/admin/news/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Article Management API Functions
export async function getArticles(token: string, params: {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  language?: string;
  category?: string;
  title?: string;
  content?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${API_BASE}/api/admin/articles?${queryParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  console.log('API Request:', {
    url,
    headers,
    token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
  });
  
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  console.log('API Response:', res.status, res.statusText);
  
  if (!res.ok) {
    const errorData = await res.text();
    console.log('Error response:', errorData);
    throw new Error(`HTTP error! status: ${res.status} - ${errorData}`);
  }
  
  return res.json();
}

export async function getArticleById(token: string, articleId: string) {
  console.log('getArticleById called with:', { articleId, token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN' });
  
  const url = `${API_BASE}/api/admin/article/${articleId}`;
  console.log('Fetching from URL:', url);
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('getArticleById response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('getArticleById error response:', errorText);
    throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  console.log('getArticleById response data:', data);
  return data;
}

export async function lockArticle(token: string, articleId: string) {
  const res = await fetch(`${API_BASE}/api/admin/article/${articleId}/lock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function unlockArticle(token: string, articleId: string) {
  const res = await fetch(`${API_BASE}/api/admin/article/${articleId}/unlock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function checkLockStatus(token: string, articleId: string) {
  const res = await fetch(`${API_BASE}/api/admin/article/${articleId}/lock-status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function updateArticleContent(token: string, articleId: string, data: Record<string, any>) {
  console.log('updateArticleContent called with:', { 
    articleId, 
    token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
    data 
  });
  
  const url = `${API_BASE}/api/admin/article/${articleId}`;
  console.log('Updating article at URL:', url);
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  console.log('updateArticleContent response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('updateArticleContent error response:', errorText);
    throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
  }
  
  const responseData = await res.json();
  console.log('updateArticleContent response data:', responseData);
  return responseData;
}

export async function publishArticle(token: string, articleId: string, isPublished: boolean) {
  const res = await fetch(`${API_BASE}/api/admin/article/${articleId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isPublished }),
  });
  return res.json();
} 

// Dashboard Statistics API (Superadmin only)
export async function getDashboardStats(token: string) {
  const res = await fetch(`${API_BASE}/api/superadmin/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}

// Auto-Publish Mode API (Superadmin only)
export async function getAutoPublishStatus(token: string) {
  const res = await fetch(`${API_BASE}/api/superadmin/autopublish/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}

export async function toggleAutoPublishMode(token: string, enabled: boolean) {
  const res = await fetch(`${API_BASE}/api/superadmin/autopublish/toggle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enabled }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
} 

export async function deactivateAdmin(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/superadmin/admin/${id}/deactivate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function changeAdminRole(token: string, id: string, role: 'admin' | 'superadmin') {
  const res = await fetch(`${API_BASE}/api/superadmin/admin/${id}/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  return res.json();
} 

export async function getAllAdmins(token: string) {
  const res = await fetch(`${API_BASE}/api/superadmin/admins`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
} 