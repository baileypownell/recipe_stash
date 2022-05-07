import React from 'react' // documentation suggests this isn't necessary, but at least with my current configuration, it is...
import { createRoot } from 'react-dom/client'
import { App } from './components/index'
import './scss/main.scss'

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App></App>)

