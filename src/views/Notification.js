
import 'regenerator-runtime/runtime'
import React from 'react'

// this component gets rendered by App after the form is submitted
export default function Notification() {
    const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
    return (
        <aside>
            <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
                {window.accountId}
            </a>
            {' '/* React trims whitespace around tags; insert literal space character when needed */}
            called method: 'set_greeting' in contract:
            {' '}
            <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
                {window.contract.contractId}
            </a>
            <footer>
                <div>✔ Succeeded</div>
                <div>Just now</div>
            </footer>
        </aside>
    )
}
