import React from 'react'
import ReactDOM from 'react-dom/client'
import { NameForm } from './NameForm.tsx'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NameForm></NameForm>
    </React.StrictMode>,
)
