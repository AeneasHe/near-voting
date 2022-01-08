import 'regenerator-runtime/runtime'
import React from 'react'
import { logout } from './utils'
import './global.css'

import Voting from './views/Voting'
import Greeting from './views/Greeting'
import Login from './views/Login'
import Notification from './views/Notification'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  const [page, setPage] = React.useState('Voting')

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (<Login />)
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <div className="navigation">
          <div className="nav" onClick={() => setPage('Voting')}> Voting </div>
          <div className="nav" onClick={() => setPage('Greeting')}> Greeting </div>
        </div>
        {page == 'Voting' ?
          <Voting />
          :
          < Greeting />
        }
      </main>
      {showNotification && <Notification />}
    </>
  )
}
