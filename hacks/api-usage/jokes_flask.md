---
title: AP CSP Topic Review Survey
layout: post
description: Survey to determine which AP CSP topics need the most review for our study guide
permalink: /python/flask/api/jokes
image: /images/jokes.png
breadcrumb: true
show_reading_time: false
---

## 📊 Vote on Topics You Need Help With

Help us prioritize our AP CSP study guide! Vote on topics:
- **Need Review 📚**: Click if you need more practice on this topic
- **Understand Well ✅**: Click if you already understand this topic well

<table>
  <thead>
  <tr>
    <th>AP CSP Topic</th>
    <th>Need Review 📚</th>
    <th>Understand Well ✅</th>
  </tr>
  </thead>
  <tbody id="result">
    <!-- javascript generated data -->
  </tbody>
</table>

<script type="module">
  import { javaURI, pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

  // Prepare HTML defined "result" container for new output
  const resultContainer = document.getElementById("result");

  // Keys for topic reactions
  const NEED_REVIEW = "need_review";
  const UNDERSTAND_WELL = "understand_well";

  // Prepare fetch urls (keeping same /api/jokes endpoint)
  const url = `${pythonURI}/api/jokes`;
  const getURL = url + "/";
  const likeURL = url + "/like/";      // now means "need review"
  const jeerURL = url + "/jeer/";      // now means "understand well"

  // Prepare fetch PUT options
  const reactOptions = {...fetchOptions,
    method: 'PUT',
  };

  // Fetch the API to obtain topics data
  fetch(getURL, fetchOptions)
    .then(response => {
      if (response.status !== 200) {
        error('GET API response failure: ' + response.status);
        return;
      }
      response.json().then(data => {
        console.log(data);
        // Format response data into a table
        for (const row of data) {
          // Make "tr element" for each "row of data"
          const tr = document.createElement("tr");

          // td for topic cell
          const topic = document.createElement("td");
          topic.innerHTML = row.id + ". " + row.topic;
          topic.style.fontSize = "14px";

          // td for need_review cell with onclick actions
          const needReview = document.createElement("td");
          const needReviewBtn = document.createElement('button');
          needReviewBtn.id = NEED_REVIEW + row.id;
          needReviewBtn.innerHTML = "📚 " + row.need_review;
          needReviewBtn.style.padding = "8px 15px";
          needReviewBtn.style.cursor = "pointer";
          needReviewBtn.onclick = function () {
            reaction(NEED_REVIEW, likeURL + row.id, needReviewBtn.id);
          };
          needReview.appendChild(needReviewBtn);

          // td for understand_well cell with onclick actions
          const understandWell = document.createElement("td");
          const understandWellBtn = document.createElement('button');
          understandWellBtn.id = UNDERSTAND_WELL + row.id;
          understandWellBtn.innerHTML = "✅ " + row.understand_well;
          understandWellBtn.style.padding = "8px 15px";
          understandWellBtn.style.cursor = "pointer";
          understandWellBtn.onclick = function () {
            reaction(UNDERSTAND_WELL, jeerURL + row.id, understandWellBtn.id);
          };
          understandWell.appendChild(understandWellBtn);

          // Finish row and append to DOM container
          tr.appendChild(topic);
          tr.appendChild(needReview);
          tr.appendChild(understandWell);
          resultContainer.appendChild(tr);
        }
      })
    })
    .catch(err => {
      error(err + ": " + getURL);
    });

  // Function and interval to refresh the vote counts every 5 seconds
  function refreshReactions() {
    fetch(getURL, fetchOptions)
      .then(response => response.json())
      .then(data => {
        // Update all reaction data
        for (const row of data) {
          const needReviewBtn = document.getElementById(NEED_REVIEW + row.id);
          if (needReviewBtn) needReviewBtn.innerHTML = "📚 " + row.need_review;
          const understandWellBtn = document.getElementById(UNDERSTAND_WELL + row.id);
          if (understandWellBtn) understandWellBtn.innerHTML = "✅ " + row.understand_well;
        }
      })
      .catch(err => {
        
        console.error('Refresh error:', err);
      });
  }
  // Call refreshReactions every 5 seconds
  setInterval(refreshReactions, 5000);

  // Reaction function to handle user vote actions
  function reaction(type, postURL, elemID) {
    // Fetch the API
    fetch(postURL, reactOptions)
    
    .then(response => {
      // Check for response errors
      if (response.status !== 200) {
          error("Post API response failure: " + response.status)
          return;
      }
      // Valid response will have JSON data
      response.json().then(data => {
          console.log(data);
          // Votes updated/incremented
          if (type === NEED_REVIEW)
            document.getElementById(elemID).innerHTML = "📚 " + data.need_review;
          else if (type === UNDERSTAND_WELL)
            document.getElementById(elemID).innerHTML = "✅ " + data.understand_well;
          else
            error("unknown type: " + type);
      })
    })
    
    .catch(err => {
      error(err + " " + postURL);
    });
  
  }

  // Something went wrong with actions or responses
  function error(err) {
    
    console.error(err);
   
   const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.innerHTML = err;
    td.colSpan = 3;
    tr.appendChild(td);
    resultContainer.appendChild(tr);
  }

</script>
