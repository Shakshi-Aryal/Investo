import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="716900923722-2570apf8khecitbmi9eudofohdrhbsfl.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
