import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
//import App from './App.jsx'
import App from "./components/App";


createRoot(document.getElementById('root')).render(
  
   //myelement

    <StrictMode>
      <h1>Hello React!</h1>
     <App />
    </StrictMode> 
  
)


 