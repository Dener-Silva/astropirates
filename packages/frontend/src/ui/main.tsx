import React from 'react'
import ReactDOM from 'react-dom/client'
import { NameForm } from './NameForm.tsx'
import { ScoreDisplay } from './ScoreDisplay.tsx'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ScoreDisplay></ScoreDisplay>
        <NameForm></NameForm>
    </React.StrictMode>,
)
