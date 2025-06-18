   // Show spinner when user triggers search
    window.onload = () => {
      const spinner = document.getElementById('loadingSpinner');
      const searchInput = document.querySelector('input.gsc-input');
      const searchButton = document.querySelector('button.gsc-search-button');

      if (!searchInput || !searchButton) return;

      // Show spinner on search click
      searchButton.addEventListener('click', () => {
        spinner.style.display = 'block';
      });

      // Show spinner on enter keypress inside search input
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          spinner.style.display = 'block';
        }
      });

      // Listen for search results load event (Google CSE triggers an event)
      window.__gcse = {
        callback: function() {
          // Hide spinner when results are loaded
          spinner.style.display = 'none';
        }
      };
    };