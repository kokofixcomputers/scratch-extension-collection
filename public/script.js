// script.js

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('search-bar').addEventListener('input', handleSearch);
    
    // Initial fetch of plugins on page load
    fetchPlugins();
});

// Function to fetch and display plugins from the backend
function fetchPlugins() {
    const container = document.getElementById("plugin-container");
    
    container.innerHTML = "<p>Loading...</p>"; // Clear previous content

    fetch("/api/plugins") // Fetch from the API endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse JSON data
        })
        .then(plugins => {
            container.innerHTML = ""; // Clear loading message
            const uniqueTags = new Set(); // Set to hold unique tags

            plugins.forEach(plugin => {
                const card = createPluginCard(
                    plugin.name,
                    plugin.description,
                    plugin.author,
                    plugin.tags.join(", "),
                    plugin.downloadUrl,
                    plugin.license,
                    plugin.version,
                    plugin.discordSupport,
                    plugin.media
                );

                container.appendChild(card); // Append card to container

                // Add tags to the set
                plugin.tags.forEach(tag => {
                    uniqueTags.add(tag.trim().toLowerCase());
                });
            });

            createTagButtons(Array.from(uniqueTags).sort()); // Create tag buttons
        })
        .catch(error => {
            console.error("Error fetching plugins:", error);
            showErrorModal(); // Show error modal on failure
        });
}

// Function to create a plugin card HTML element
function createPluginCard(name, description, author, tags, downloadUrl, license, version_input, discordSupport, media) {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    const img = document.createElement("div");
    img.className = "card-media";
    img.innerHTML = `<img src="${media}">`;
    
   header.innerHTML = `<h2>${name}</h2><p class='author'>Author: ${author}</p>`;

   const version = document.createElement("div");
   version.className = "card-version";
   version.innerHTML = `<p>Version: ${version_input}</p>`;
   
   const body = document.createElement("div");
   body.className = "card-body";
   body.innerHTML = `<p>${description}</p>`;
   
   const tagList = document.createElement("ul");
   tagList.className = "tags";
   
   tags.split(",").forEach(tag => {
       const tagItem = document.createElement("li");
       tagItem.textContent = tag.trim();
       tagList.appendChild(tagItem);
   });
   
   body.appendChild(tagList);
   

   const downloadButton = document.createElement("a");
   downloadButton.href = downloadUrl;
   downloadButton.className = "button download";
   downloadButton.textContent = "Download";
   downloadButton.target = "_blank";
   
   body.appendChild(downloadButton);

   const licenseButton = document.createElement("a");
   licenseButton.href = license;
   licenseButton.className = "button info";
   licenseButton.textContent = "License";
   licenseButton.target = "_blank";
   
   body.appendChild(licenseButton);


   card.appendChild(img);
   card.appendChild(header);
   card.appendChild(version);
   card.appendChild(body);

   return card; // Return the constructed card element
}

// Function to create tag buttons based on unique tags from plugins
function createTagButtons(tags) {
   const tagButtonsContainer = document.querySelector(".tag-buttons-container");
   tagButtonsContainer.innerHTML = ""; // Clear existing tag buttons

   tags.forEach(tag => {
       const button = document.createElement("button");
       button.className = "tag-button";
       button.setAttribute("data-tag", tag.toLowerCase()); // Store tag in lowercase for consistent filtering
       button.textContent = capitalizeWords(tag); // Capitalize the tag for display

       button.addEventListener("click", handleTagFilter); // Add click event for filtering
       tagButtonsContainer.appendChild(button); // Append button to container
   });
}

// Function to handle search and filter the plugin cards
function handleSearch() {
   const searchTerm = document.getElementById("search-bar").value.toLowerCase();
   const cards = document.querySelectorAll(".card");

   cards.forEach(card => {
       const titleTextContent= card.querySelector('.card-header h2').textContent.toLowerCase();
       const descriptionTextContent= card.querySelector('.card-body p').textContent.toLowerCase();

       if (titleTextContent.includes(searchTerm) || descriptionTextContent.includes(searchTerm)) {
           card.style.display= ""; // Show matching cards
       } else {
           card.style.display= "none"; // Hide non-matching cards
       }
   });
}

// Function to handle filtering by tags
function handleTagFilter(event) {
   const button = event.target;
   const selectedTag = button.getAttribute("data-tag").toLowerCase().trim(); 

   const isSelected = button.classList.contains("selected"); 
   
   if (isSelected) { 
       button.classList.remove("selected"); 
   } else { 
       document.querySelectorAll(".tag-button").forEach(btn => btn.classList.remove("selected")); 
       button.classList.add("selected"); 
   }

   const cards = document.querySelectorAll(".card");

   cards.forEach(card => { 
       const tags = Array.from(card.querySelectorAll(".tags li")).map(tagElement => tagElement.textContent.toLowerCase().trim()); 

       if (isSelected) { 
           card.style.display= ""; 
       } else { 
           if (tags.includes(selectedTag)) { 
               card.style.display= ""; 
           } else { 
               card.style.display= "none"; 
           } 
       } 
   });
}

// Function to show error modal when fetching fails
function showErrorModal() { 
     const modal = document.getElementById("myModal"); 
     modal.style.display= "block"; 

     const spanCloseModal= document.getElementById("closeyeah"); 
     spanCloseModal.onclick= function() { modal.style.display= "none"; }; 

     window.onclick= function(event) { 
         if (event.target === modal) { modal.style.display= "none"; } 
     }; 
}

// Function to capitalize the first letter of each word in a string
function capitalizeWords(str) { 
     return str.replace(/\b\w/g, (char) => char.toUpperCase()); 
}