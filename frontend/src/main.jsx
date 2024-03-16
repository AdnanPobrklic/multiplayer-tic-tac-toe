import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Singleplayer from './pages/Singleplayer'
import Multiplayer from './pages/Multiplayer'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: "/",
    element: < Home />,
    errorElement: < NotFound /> 
  },
  {
    path: "/single-player",
    element: < Singleplayer />
  },
  {
    path: "/live-game/:gameId",
    element: < Multiplayer />
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    < RouterProvider router={router} />
  </React.StrictMode>,
)
