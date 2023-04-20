'use strict';
const https = require("https");
const express = require('express');
const fs = require('fs');
const app = express();

https
    .createServer({
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem"),
    },app)
    .listen(443, ()=>{
        console.log('server is runing at port 443')
    });

app.use(express.json());

// Your code starts here. Placeholders for .get and .post are provided for
//  your convenience.
const candidates = {};

app.get('/', function(req, res) {
    console.log('here')
    function getCandidate(id) {
        return {
            "id": `person_${id}`,
            "name": "Amy Fish",
            "skills": [ "scala", "go", `skill_id_${id}` ]
        }
    }
    for (let i = 0; i < 10_000; i++) {
        candidates[i] = getCandidate(i);
    }

    res.status(200).json({status: 'ok'});
});

app.post('/candidates', function(req, res) {
    const { id } = req.body;
    console.log('req: ', req.body);
    candidates[id] = req.body;

    // console.log('candidates: ', JSON.stringify(candidates));

    res.status(200).json({status: 'ok'})
    // ...
});

app.get('/candidates/search', function(req, res) {
    // ...
    const { skills } = req.query;
    const skillsArr  = skills?.split(",");
    if (!skillsArr.length) {
        res.status(400).json({error: true});
        return;
    }
    // find candidate
    const topCandidate = findCadidate(skillsArr, candidates);

    if (!topCandidate) {
        res.status(404).json({error: true});

        return;
    }

    res.status(200).json(topCandidate);
});



// app.listen(process.env.HTTP_PORT || 3000);

function findCadidate(skillsList, candidates) {
    const score = {}; // number : id
    for (const candidate of Object.values(candidates)) {
        const {id, skills} = candidate;
        const candidateScore = intersection(skillsList, skills);
        if (!candidateScore) { // skip cadidates with no skills found
            continue;
        }
        score[candidateScore] = id;
    }
    const scores = Object.keys(score);
    if (!scores.length) {
        return null;
    }
    const maxScore = Math.max(...scores);

    return candidates[score[maxScore]];
}

function intersection(nums1, nums2) {
    const set = new Set(nums1);
    const fileredSet = new Set(nums2.filter((n) => set.has(n)));
    return fileredSet.size;
}
