import 'regenerator-runtime/runtime'
import React from 'react'
// import './bootstrap.min.css'


let candidates = {
    "Alice": "candidate-1",
    "Bob": "candidate-2",
    "Carol": "candidate-3"
}

let candidate_hashes = {
    "Alice": "Vote for Alice",
    "Bob": "Vote for Bob",
    "Carol": "Vote for Carol"
}
let votes_received_default = {
    "Alice": "0",
    "Bob": "0",
    "Carol": "0"
}

export default function Voting() {
    // 注意为了防止引用问题，votes_received存储map的json字符串，而不是直接存储map
    const [votes_received, set_votes_received] = React.useState(votes_received_default)

    const [candidate_name, set_candidate_name] = React.useState('')

    const [signature, set_signature] = React.useState('')

    const [votes_change, set_votes_change] = React.useState(false)

    const voter = window.accountId

    let setCandidates = React.useCallback(() => {
        console.log("init voting set candidate")

        let hashes = ['Alice', 'Bob', 'Carol'].map(name => { return candidate_hashes[name] })
        window.contract.set_candidates({ candidate_names: ['Alice', 'Bob', 'Carol'], candidate_hashes: hashes })
            .then(res => {
                console.log("set candidatets result: ", res)
            })
    }, [])

    let resetVotes = React.useCallback(() => {
        window.contract.reset_votes({}).then(res => {
            console.log('reset result:', res)
            set_votes_change(!votes_change)
        })
    })


    let voteForCandidate = React.useCallback(() => {
        console.log(candidate_name)
    }, [candidate_name])

    let handleCandidateNameChange = React.useCallback((e) => {
        set_candidate_name(e.target.value)
        if (candidate_hashes[e.target.value]) {
            set_signature(candidate_hashes[e.target.value])
        }
    }, [])

    // let handleSignatureChange = React.useCallback((e) => {
    //     e.preventDefault();
    //     //set_signature(e.target.value);

    // })

    // 提交投票数据
    let submitVote = React.useCallback(() => {
        window.contract.vote_for_candidate({ candidate: candidate_name, voter: voter, signed_message: signature })
            .then(res => {
                console.log("submit vote result:", res),
                    set_votes_change(!votes_change)
            })
    })

    // 查询投票数据后更新结果
    React.useEffect(() => {
        let votes_recieved_current_str = JSON.stringify(votes_received)

        let tasks = Object.keys(candidates).map(candidate => {
            return new Promise((resolve, reject) => {
                window.contract.total_votes_for({ candidate: candidate })
                    .then(votes => {
                        if (votes_received[candidate] != votes) {
                            console.log('votes status:', candidate, votes)
                            votes_received[candidate] = votes
                        }
                        resolve(true)
                    }).catch((error) => {
                        resolve(false)
                    })
            })
        })

        Promise.all(tasks).then((result) => {
            console.log("task result:", result)
            let votes_received_new_str = JSON.stringify(votes_received)
            if (votes_recieved_current_str != votes_received_new_str) {
                set_votes_change(!votes_change)
            }
        }).catch((error) => {
            console.log(error)
        })

    }, [])


    return (
        <main>
            <div className="banner">
                <h1 className="text-center">Decentralized Voting DAPP</h1>
            </div>
            <div className="container col-margin-top-2">

                <div id="address"></div>

                <button type="submit" className="btn btn-primary" onClick={setCandidates}>Init</button>
                <button type="submit" className="btn btn-primary" onClick={resetVotes}>Reset</button>
                <div className="table-responsive">
                    <h2>Current Votes</h2>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.keys(candidates).map(key => {
                                    return (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td id={candidates[key]}>{votes_received[key]}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>

                <div className="row">
                    <div className="col-sm-6">
                        <h2>Vote for your favorite candidate</h2>
                        <div className="form-inline">
                            <div className="form-group">
                                <label id="candidate">Candidate</label>
                                <input value={candidate_name} onChange={handleCandidateNameChange} type="text" className="form-control" id="candidate" placeholder="Ex: Carol" />
                            </div>
                            <button type="submit" className="btn btn-primary" onClick={voteForCandidate}>Generate Vote</button>
                        </div>
                        <strong><div id="msg"></div></strong>
                        <div id="vote-for"></div>
                        <div id="addr"></div>
                        <div id="signature"></div>

                    </div>
                    <div className="col-sm-6">
                        <h2>Submit vote to blockchain</h2>
                        <div className="form-horizontal">
                            <div className="form-group">
                                <label id="candidate" className="col-sm-2 control-label">Candidate</label>
                                <div className="col-sm-10">
                                    <input value={candidate_name} onChange={handleCandidateNameChange} className="form-control" id="candidate-name" placeholder="Ex: Carol" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label id="voter-address" className="col-sm-2 control-label">Voter Address</label>
                                <div className="col-sm-10">
                                    <input defaultValue={voter} className="form-control" id="voter-address" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label id="vote-signature" className="col-sm-2 control-label">Signature</label>
                                <div className="col-sm-10">
                                    <div className="form-control" id="voter-signature" > {signature} </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="col-sm-offset-2 col-sm-10">
                                    <button type="submit" onClick={submitVote} className="btn btn-primary">Submit Vote</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )

}