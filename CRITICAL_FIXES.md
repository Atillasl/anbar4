# 🔧 CRITICAL FIXES - CODE SOLUTIONS

This document provides ready-to-use code fixes for the 6 critical issues that prevent production deployment.

---

## FIX #1: BROKEN AUTHENTICATION SYSTEM

### Problem Location
- [App.jsx](App.jsx) - Line 18-20
- [ProtectedRoute.jsx](ProtectedRoute.jsx) - Line 3
- [Login.jsx](pages/Login.jsx) - Line 28

### Solution

**Step 1: Update ProtectedRoute.jsx**
```javascript
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // FIX: Check for isLoggedIn flag (matching App.jsx)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

**Step 2: Update App.jsx to use ProtectedRoute**
```javascript
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header';
import ProtectedRoute from './ProtectedRoute'; // Import

// ... imports

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('app_user'); // Also clear user data
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white">
        {isAuthenticated && <Header onLogout={handleLogout} />}

        <main className="animate-in fade-in duration-700">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
            />
            
            {/* Protect all routes with ProtectedRoute */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
            <Route path="/warehouse/:id" element={<ProtectedRoute><WarehouseDetail /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
```

**Step 3: Deprecate storing user data at all**
In [Login.jsx](pages/Login.jsx) - Mark for future auth service:
```javascript
// TODO: Replace with proper authentication service
// DO NOT store passwords in localStorage!
// Instead: Use Firebase Auth, Auth0, JWT tokens, or similar
```

---

## FIX #2: REMOVE PLAIN-TEXT PASSWORD STORAGE

### Problem
[Login.jsx](pages/Login.jsx) stores passwords in plain text in localStorage (CRITICAL security issue).

### Immediate Workaround (NOT RECOMMENDED FOR PRODUCTION)
```javascript
// src/utils/authUtils.js
import crypto from 'crypto-js'; // npm install crypto-js

// WARNING: This is NOT secure for production!
// All encryption happens client-side, keys are exposed in source code
// Use a proper authentication service instead!

const ENCRYPTION_KEY = 'CHANGE_THIS_TO_ENVIRONMENT_VARIABLE';

export const encryptPassword = (password) => {
  return crypto.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encryptedPassword) => {
  const bytes = crypto.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
};

// Then in Login.jsx:
// Instead of: localStorage.setItem('app_user', JSON.stringify(formData));
// Use:
const encryptedUser = {
  email: formData.email,
  password: encryptPassword(formData.password) // Store encrypted
};
localStorage.setItem('app_user', JSON.stringify(encryptedUser));
```

### RECOMMENDED SOLUTION - Use Backend Authentication
```javascript
// src/services/authService.js
export const authService = {
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const { token } = await response.json();
    
    // Store only the token, not the password!
    localStorage.setItem('authToken', token);
    return token;
  },
  
  async logout() {
    localStorage.removeItem('authToken');
  },
  
  getToken() {
    return localStorage.getItem('authToken');
  }
};

// In Login.jsx:
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await authService.login(formData.email, formData.password);
    onLogin();
  } catch (error) {
    setError('Login failed. Please check your credentials.');
  }
};
```

---

## FIX #3: MISSING updateProduct FUNCTION

### Problem Location
[useWarehouse.js](hooks/useWarehouse.js) - Missing the `updateProduct` function that [WarehouseDetail.jsx](pages/WarehouseDetail.jsx#L23) calls.

### Solution

**Update [useWarehouse.js](hooks/useWarehouse.js):**
```javascript
import { useState, useEffect } from 'react';

export const useWarehouse = (id) => {
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const whs = JSON.parse(localStorage.getItem('my_warehouses') || '[]');
    setWarehouse(whs.find(w => w.id === Number(id)));
    setProducts(JSON.parse(localStorage.getItem(`products_wh_${id}`) || '[]'));
  }, [id]);

  const addProduct = (productData) => {
    const updated = [...products, { ...productData, id: Date.now() }];
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  // ADD THIS FUNCTION (was missing)
  const updateProduct = (productId, updatedData) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, ...updatedData }
        : p
    );
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  const deleteProduct = (pid) => {
    const updated = products.filter(p => p.id !== pid);
    setProducts(updated);
    localStorage.setItem(`products_wh_${id}`, JSON.stringify(updated));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // IMPORTANT: Add updateProduct to return!
  return { 
    warehouse, 
    products: filteredProducts, 
    addProduct, 
    updateProduct,  // ← ADD THIS
    deleteProduct, 
    searchTerm, 
    setSearchTerm 
  };
};
```

---

## FIX #4: ADD ERROR BOUNDARIES

### Step 1: Create ErrorBoundary Component

**Create [src/Components/ErrorBoundary.jsx](Components/ErrorBoundary.jsx):**
```javascript
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Send to error tracking service (Sentry, LogRocket, etc.)
    // reportErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 max-w-md w-full shadow-2xl text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-6">
              <AlertCircle size={40} className="text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Xəta Baş Verdi
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Tənzimlə bir problem yaranıb. Lütfən zəhmətin olmasa səhifəni yenidən yüklə.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left text-xs overflow-auto max-h-32">
                <p className="font-black text-red-600 mb-2">Error Details:</p>
                <pre className="text-gray-700 dark:text-gray-300">
                  {this.state.error?.message}
                </pre>
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <RefreshCw size={18} /> Yenidən Yüklə
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-3 rounded-2xl font-black uppercase text-sm mt-3"
            >
              Ana Səhifəyə Qayıt
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Step 2: Wrap App with ErrorBoundary

**Update [src/index.js](index.js):**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './Components/ErrorBoundary'; // Import
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
```

---

## FIX #5: SAFE localStorage OPERATIONS

### Create Storage Utility

**Create [src/utils/storageUtils.js](utils/storageUtils.js):**
```javascript
/**
 * Safe localStorage operations with error handling
 */

export const getSafeFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    // If key doesn't exist
    if (item === null) {
      return defaultValue;
    }
    
    // Try to parse JSON
    try {
      const parsed = JSON.parse(item);
      
      // Validate that it's actually an object or array (not corrupted)
      if (parsed === null || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
        console.warn(`Storage key "${key}" contains invalid data, using default`);
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return parsed;
    } catch (parseError) {
      // JSON parse failed - data is corrupted
      console.error(`Failed to parse storage key "${key}":`, parseError);
      localStorage.removeItem(key); // Clear corrupted data
      return defaultValue;
    }
  } catch (error) {
    console.error(`Storage read error for key "${key}":`, error);
    return defaultValue;
  }
};

export const setSafeToStorage = (key, value, options = {}) => {
  const { silent = false } = options;
  
  try {
    // Validate data before storing
    if (value === undefined) {
      throw new Error('Cannot store undefined value');
    }
    
    const serialized = JSON.stringify(value);
    
    // Check size (localStorage limit is ~5-10MB)
    if (serialized.length > 1024 * 1024) {
      console.warn(`Storage value for key "${key}" exceeds 1MB limit`);
    }
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error(`localStorage quota exceeded for key "${key}". Item size: ${JSON.stringify(value).length} bytes`);
      if (!silent) {
        alert('Yaddaş limiti aşıldı. Bəzi məlumatları silin.');
      }
    } else {
      console.error(`Storage write error for key "${key}":`, error);
      if (!silent) {
        alert('Məlumat saxlama xətası. Lütfən yenidən cəhd edin.');
      }
    }
    return false;
  }
};

export const removeSafeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error);
    return false;
  }
};

export const clearAllAppData = () => {
  try {
    // Get all warehouse IDs first
    const warehouses = getSafeFromStorage('my_warehouses', []);
    
    // Clear main data
    removeSafeFromStorage('isLoggedIn');
    removeSafeFromStorage('app_user');
    removeSafeFromStorage('my_warehouses');
    removeSafeFromStorage('my_projects');
    
    // Clear all warehouse-specific data
    warehouses.forEach(wh => {
      removeSafeFromStorage(`products_wh_${wh.id}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};
```

### Update All Files Using localStorage

**Example: Update [useProjects.js](hooks/useProjects.js):**
```javascript
import { useState, useEffect } from 'react';
import { getSafeFromStorage, setSafeToStorage } from '../utils/storageUtils';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // FIX: Use safe storage function
    const saved = getSafeFromStorage('my_projects', []);
    setProjects(saved);
  }, []);

  const saveAndSet = (newList) => {
    setProjects(newList);
    // FIX: Use safe storage function
    setSafeToStorage('my_projects', newList);
  };

  const addProject = (newProj) => {
    const projectWithData = {
      ...newProj,
      id: Date.now(),
      budget: Number(newProj.budget || 0),
      createdAt: new Date().toISOString()
    };
    const updated = [projectWithData, ...projects];
    saveAndSet(updated);
  };

  const updateProject = (id, updatedData) => {
    const updated = projects.map(p => 
      p.id === id 
        ? { ...p, ...updatedData, budget: Number(updatedData.budget || p.budget) } 
        : p
    );
    saveAndSet(updated);
  };

  const deleteProject = (id) => {
    if (window.confirm("Bu layihəni silmək istədiyinizə əminsiniz?")) {
      const updated = projects.filter(p => p.id !== id);
      saveAndSet(updated);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { 
    projects: filteredProjects, 
    allProjects: projects,
    searchTerm, 
    setSearchTerm, 
    addProject, 
    updateProject,
    deleteProject 
  };
};
```

---

## FIX #6: INPUT VALIDATION & SANITIZATION

### Create Validation Utilities

**Create [src/utils/validation.js](utils/validation.js):**
```javascript
/**
 * Input validation and sanitization utilities
 */

// Sanitize HTML to prevent XSS
export const sanitizeInput = (str) => {
  if (!str) return '';
  
  const div = document.createElement('div');
  div.textContent = str; // textContent escapes HTML
  return div.innerHTML;
};

export const validateProjectInput = (data) => {
  const errors = {};
  
  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Layihə adı mütləqdir';
  } else if (data.name.length > 100) {
    errors.name = 'Adı 100 simvoldan az olmalıdır';
  }
  
  // Client validation
  if (data.client && data.client.length > 100) {
    errors.client = 'Müştəri adı 100 simvoldan az olmalıdır';
  }
  
  // Budget validation
  if (data.budget !== undefined && data.budget) {
    const budget = Number(data.budget);
    if (isNaN(budget) || budget < 0) {
      errors.budget = 'Büdcə müsbət rəqəm olmalıdır';
    }
  }
  
  // Date validation
  if (!data.startDate) {
    errors.startDate = 'Başlama tarixi mütləqdir';
  }
  if (!data.endDate) {
    errors.endDate = 'Bitişə tarixi mütləqdir';
  }
  
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start > end) {
      errors.dates = 'Başlama tarixi bitişə tarihindən əvvəl olmalıdır';
    }
  }
  
  // Sanitize strings
  const sanitized = {
    ...data,
    name: sanitizeInput(data.name),
    client: sanitizeInput(data.client || ''),
    notes: sanitizeInput(data.notes || '')
  };
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitized
  };
};

export const validateProductInput = (data) => {
  const errors = {};
  
  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Məhsul adı mütləqdir';
  } else if (data.name.length > 100) {
    errors.name = 'Adı 100 simvoldan az olmalıdır';
  }
  
  // Price validation
  if (!data.price) {
    errors.price = 'Qiymət mütləqdir';
  } else {
    const price = Number(data.price);
    if (isNaN(price) || price < 0) {
      errors.price = 'Qiymət müsbət rəqəm olmalıdır';
    }
  }
  
  // Cost price validation
  if (!data.costPrice) {
    errors.costPrice = 'Maya dəyəri mütləqdir';
  } else {
    const costPrice = Number(data.costPrice);
    if (isNaN(costPrice) || costPrice < 0) {
      errors.costPrice = 'Maya dəyəri müsbət rəqəm olmalıdır';
    }
  }
  
  // Category validation
  if (data.category?.length > 50) {
    errors.category = 'Kateqoriya 50 simvoldan az olmalıdır';
  }
  
  // Sanitize
  const sanitized = {
    ...data,
    name: sanitizeInput(data.name),
    category: sanitizeInput(data.category || '')
  };
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitized
  };
};

export const validateWarehouseInput = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Anbar adı mütləqdir';
  } else if (data.name.length > 100) {
    errors.name = 'Adı 100 simvoldan az olmalıdır';
  }
  
  if (data.description?.length > 500) {
    errors.description = 'Təsvir 500 simvoldan az olmalıdır';
  }
  
  const sanitized = {
    ...data,
    name: sanitizeInput(data.name),
    description: sanitizeInput(data.description || '')
  };
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitized
  };
};
```

### Update Modal Components to Use Validation

**Example: Update [CreateProjectModal.jsx](Components/CreateProjectModal.jsx):**
```javascript
import { validateProjectInput } from '../utils/validation';

const CreateProjectModal = ({ isOpen, onClose, onConfirm, initialData = null }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    client: '', 
    startDate: '', 
    endDate: '', 
    prepayment: '', 
    notes: '',
    budget: ''
  });
  
  const [errors, setErrors] = useState({});

  // ... existing code ...

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // FIX: Validate input first
    const { isValid, errors: validationErrors, data: sanitizedData } = validateProjectInput(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    onConfirm({ 
      ...sanitizedData,
      id: initialData ? initialData.id : Date.now(), 
      status: initialData ? initialData.status : 'Aktiv', 
      items: initialData ? initialData.items : [],
      progress: initialData ? initialData.progress : 0 
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0D1117] w-full max-w-2xl rounded-[3rem] p-10 md:p-14 shadow-[0_0_50px_rgba(234,179,8,0.1)] border border-slate-200 dark:border-white/5 relative overflow-hidden">
        
        {/* ... header ... */}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="relative">
            <input 
              className="w-full p-5 pl-14 bg-slate-50 dark:bg-white/5 dark:text-white border-2 border-transparent focus:border-yellow-500 rounded-2xl font-bold outline-none transition-all placeholder:text-slate-400" 
              placeholder="LAYİHƏ ADI" 
              value={formData.name}
              onChange={e => {
                setFormData({...formData, name: e.target.value});
                setErrors({...errors, name: undefined}); // Clear error on input
              }}
              required
            />
            {errors.name && (
              <p className="text-red-600 text-xs font-black mt-1 ml-4">{errors.name}</p>
            )}
          </div>

          {/* ... other fields with error messages ... */}
          
          <button 
            type="submit"
            className="w-full p-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest"
          >
            {initialData ? 'Yadda Saxla' : 'Layihə Aç'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
```

---

## SUMMARY OF CHANGES

### Files Modified:
1. ✅ [src/Components/ErrorBoundary.jsx](Components/ErrorBoundary.jsx) - **NEW**
2. ✅ [src/utils/storageUtils.js](utils/storageUtils.js) - **NEW**
3. ✅ [src/utils/validation.js](utils/validation.js) - **NEW**
4. ✅ [src/index.js](index.js) - Wrap with ErrorBoundary
5. ✅ [src/App.jsx](App.jsx) - Import and use ProtectedRoute consistently
6. ✅ [src/ProtectedRoute.jsx](ProtectedRoute.jsx) - Fix to check isLoggedIn
7. ✅ [src/hooks/useWarehouse.js](hooks/useWarehouse.js) - Add updateProduct function
8. ✅ [src/hooks/useProjects.js](hooks/useProjects.js) - Update to use safe storage
9. ✅ [src/Components/CreateProjectModal.jsx](Components/CreateProjectModal.jsx) - Add validation
10. ✅ [src/pages/Login.jsx](pages/Login.jsx) - Remove password storage (or encrypt)

### Testing Checklist:
- [ ] Login redirects to dashboard
- [ ] Protected routes work correctly
- [ ] Manual error throwing shows error boundary
- [ ] Product edit functionality works
- [ ] All form inputs reject invalid data
- [ ] XSS attempts are sanitized
- [ ] localStorage corruption is handled gracefully
- [ ] Logout clears all sensitive data

---

**Implementation Time Estimate:** 10-12 hours for one developer  
**Priority:** ALL – These are blocking production deployment
