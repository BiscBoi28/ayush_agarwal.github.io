document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize AOS (From Response #5 / Original) ---
    // Ensure AOS library is included in your HTML before this script
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800, easing: 'ease-in-out', once: true, mirror: false, offset: 100
        });
    } else {
        console.warn("AOS library not found. Skipping initialization.");
    }


    // --- Theme Toggler (From Response #5 / Original) ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const bodyTag = document.getElementById('body-tag'); // Assuming your <body> tag has id="body-tag"

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (bodyTag) {
            if (theme === 'light') {
                bodyTag.classList.add('light-mode');
                bodyTag.classList.remove('dark-mode'); // Ensure dark-mode is removed if switching
                 if(themeToggleButton) themeToggleButton.textContent = '🌙'; // Or appropriate icon/text
            } else { // Default to dark
                bodyTag.classList.remove('light-mode');
                bodyTag.classList.add('dark-mode'); // Explicitly add dark-mode
                 if(themeToggleButton) themeToggleButton.textContent = '☀️'; // Or appropriate icon/text
            }
        } else {
            console.error("Body tag with id 'body-tag' not found.");
        }
    };

    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('themePreference');
    // Apply saved theme or default to dark
    applyTheme(savedTheme || 'dark');

    // Add event listener to the theme toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Determine the new theme based on the current state
             // Check based on presence of 'light-mode' class for robustness
            const currentIsLight = bodyTag ? bodyTag.classList.contains('light-mode') : false;
            const newTheme = currentIsLight ? 'dark' : 'light';

            // Apply the new theme
            applyTheme(newTheme);

            // Save the new preference to local storage
            localStorage.setItem('themePreference', newTheme);
        });
    } else {
         console.warn("Theme toggle button with id 'theme-toggle-button' not found.");
    }


    // --- Parallax & Shape Reveal (From Response #5 / Original) ---
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    const shapes = document.querySelectorAll('.bg-shape');

    function applyParallax() {
        const scrollY = window.pageYOffset;
        parallaxElements.forEach(el => {
            // Adjust the multiplier (e.g., 0.25) for more/less parallax effect
            const moveY = scrollY * 0.25;
            el.style.transform = `translate3d(0, ${moveY}px, 0)`;
        });
    }

    function revealShapes() {
        const triggerBottom = window.innerHeight / 5 * 4; // Trigger when element is 4/5ths into view
        shapes.forEach(shape => {
            const boxTop = shape.getBoundingClientRect().top;
            // Add a slight offset based on the shape's original top position for staggered effect
            const offsetTrigger = triggerBottom + (shape.offsetTop / 15); // Adjust divisor for more/less stagger

            if (boxTop < offsetTrigger) {
                shape.style.opacity = '1'; // Make shape visible
                 // Optional: Add a transform effect as well
                 // shape.style.transform = 'translateY(0) scale(1)';
            } else {
                 // Optional: Reset if you want shapes to hide when scrolling back up
                 // shape.style.opacity = '0';
                 // shape.style.transform = 'translateY(20px) scale(0.9)'; // Example reset state
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                applyParallax();
                revealShapes();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial calls on load to set initial positions/visibility
    applyParallax();
    revealShapes();


    // --- Q2: Event Tracking Functionality (From Response #5 / Original) ---
    function logEvent(eventType, eventObjectDescription) {
        const timestamp = new Date().toISOString();
        // Truncate long descriptions for clarity in console
        const description = eventObjectDescription.length > 100 ? eventObjectDescription.substring(0, 97) + '...' : eventObjectDescription;
        console.log(`${timestamp}, type: ${eventType}, object: ${description}`);
    }

    // Log page view on load
    logEvent('view', `page_load: ${window.location.pathname}`);

    // Log clicks globally
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        let objectDescription = target.tagName; // Start with the tag name

        // Add more specific identifiers if available
        if (target.id) {
            objectDescription += `#${target.id}`;
        } else if (target.getAttribute('aria-label')) {
            objectDescription += `[aria-label='${target.getAttribute('aria-label')}']`;
        } else if (target.classList.length > 0) {
            // Add the first class if no ID or aria-label
             objectDescription += `.${target.classList[0]}`;
        }

        // Context-specific descriptions (add more as needed for your site)
        if (target.tagName === 'A' && target.href) {
            objectDescription += `[href='${target.getAttribute('href')}']`; // Use getAttribute for safety
        } else if (target.tagName === 'BUTTON') {
            objectDescription += `[text='${target.textContent.trim().substring(0, 20)}']`; // Add button text (truncated)
        } else if (target.tagName === 'IMG' && target.alt) {
            objectDescription += `[alt='${target.alt}']`;
        } else if (target.tagName === 'INPUT' && target.type) {
            objectDescription += `[type='${target.type}']`;
             if(target.name) objectDescription += `[name='${target.name}']`;
        } else if (target.tagName === 'SPAN' && target.closest('.skill-tags')) {
             objectDescription += `[text='${target.textContent.trim()}'] (within .skill-tags)`;
        }

        // Add context from parent elements if useful
        const projectCard = target.closest('.project-card');
        if (projectCard) {
            const title = projectCard.querySelector('h3')?.textContent.trim();
            objectDescription += ` (within project: ${title || 'Untitled'})`;
        }

        const timelineItem = target.closest('.timeline-item');
         if (timelineItem) {
             const title = timelineItem.querySelector('.timeline-title')?.textContent.trim();
             objectDescription += ` (within timeline: ${title || 'Untitled'})`;
         }

        logEvent('click', objectDescription);
    }, true); // Use capture phase if needed, but bubbling (false/default) is usually fine


    // --- Smooth scroll for navigation links (Offset Fixed - From Response #5 / Original) ---
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"]'); // More specific selector if needed
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Basic validation for the selector
                if (!targetId || targetId === "#" || !targetId.startsWith("#")) {
                    console.warn(`Smooth scroll link has invalid href: ${targetId}`);
                    return; // Don't prevent default for invalid links
                }

                e.preventDefault(); // Prevent default only for valid hash links

                try {
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // Calculate header height dynamically or use a fixed fallback
                        const header = document.querySelector('header'); // Adjust selector if needed
                        const headerOffset = header ? header.offsetHeight : 70; // Fallback offset
                        const additionalPadding = 10; // Add a little extra space

                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - additionalPadding;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    } else {
                        console.warn(`Smooth scroll target not found for selector: ${targetId}`);
                    }
                } catch (error) {
                    // Catch errors from invalid selectors passed to querySelector
                    console.error(`Invalid selector used for smooth scroll: ${targetId}`, error);
                }
            });
        });
    }


    // --- Q3: Text Analysis Logic - NEW ---
    const textInput = document.getElementById('textInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const analysisOutput = document.getElementById('analysisOutput');

    // Define lists for categorization (lowercase for case-insensitive matching)
    // Comprehensive lists (can be expanded)
    const pronounsList = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'who', 'whom', 'whose', 'which', 'what', 'this', 'that', 'these', 'those', 'somebody', 'someone', 'something', 'anybody', 'anyone', 'anything', 'nobody', 'no one', 'nothing', 'everybody', 'everyone', 'everything', 'each', 'either', 'neither', 'all', 'any', 'most', 'none', 'some', 'such'];
    const prepositionsList = ['ago','aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without'];
    const indefiniteArticlesList = ['a', 'an','the'];
    // Note: 'the' is a *definite* article, not indefinite.

    if (analyzeButton && textInput && analysisOutput) {
        analyzeButton.addEventListener('click', () => {
            const text = textInput.value;

            // Basic validation
            if (!text || text.trim().length === 0) {
                analysisOutput.innerHTML = "<p>Please enter some text into the text box to analyze.</p>";
                return;
            }

            // Indicate processing is starting
            analysisOutput.innerHTML = "<p><em>Analyzing the text... Please wait.</em></p>";

            // Use setTimeout to prevent blocking the UI thread for potentially long text
            setTimeout(() => {
                try {
                    // --- Task 1: Basic Counts ---
                    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
                    const spaceCount = (text.match(/ /g) || []).length;
                    const newlineCount = (text.match(/\n/g) || []).length;
                    // Regex for words: includes letters, numbers, underscores, hyphens, apostrophes within word boundaries
                    const wordsArray = text.match(/\b[\w'-]+\b/g) || [];
                    const wordCount = wordsArray.length;
                    // Regex for special symbols: anything NOT a letter, number, or whitespace
                    const specialSymbolCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;

                    // --- Task 2, 3, 4: Tokenize and Count Pronouns, Prepositions, Indefinite Articles ---
                    const tokens = wordsArray.map(word => word.toLowerCase()); // Lowercase for matching

                    const pronounCounts = {};
                    const prepositionCounts = {};
                    const articleCounts = {};

                    // Initialize count objects ONLY for items found in the text
                    // This avoids listing every possible pronoun/preposition if not present
                    tokens.forEach(token => {
                        if (pronounsList.includes(token)) {
                            pronounCounts[token] = (pronounCounts[token] || 0) + 1;
                        }
                        if (prepositionsList.includes(token)) {
                            prepositionCounts[token] = (prepositionCounts[token] || 0) + 1;
                        }
                        if (indefiniteArticlesList.includes(token)) {
                            articleCounts[token] = (articleCounts[token] || 0) + 1;
                        }
                    });

                    // --- Format Output ---
                    let outputHTML = `<h3>Text Analysis Results:</h3>`;

                    outputHTML += `<h4>Basic Counts:</h4>
                                  <ul>
                                    <li>Letters: ${letterCount}</li>
                                    <li>Words: ${wordCount}</li>
                                    <li>Spaces: ${spaceCount}</li>
                                    <li>Newlines: ${newlineCount}</li>
                                    <li>Special Symbols: ${specialSymbolCount}</li>
                                  </ul><hr>`; // Added horizontal rule for separation

                    // Use helper function to format grouped counts
                    outputHTML += formatGroupCounts("Pronoun Counts:", pronounCounts);
                    outputHTML += formatGroupCounts("Preposition Counts:", prepositionCounts);
                    outputHTML += formatGroupCounts("Indefinite Article Counts:", articleCounts);

                    // Display the results
                    analysisOutput.innerHTML = outputHTML;

                } catch (error) {
                     console.error("Error during text analysis:", error);
                     analysisOutput.innerHTML = "<p style='color: red;'>An error occurred during analysis. Please check the browser console for details.</p>";
                }
            }, 50); // 50ms delay - allows the "Analyzing..." message to render
        });
    } else {
        // Log error if essential elements are missing
        if (!textInput) console.error("Text input element with id 'textInput' not found.");
        if (!analyzeButton) console.error("Analyze button element with id 'analyzeButton' not found.");
        if (!analysisOutput) console.error("Analysis output element with id 'analysisOutput' not found.");
    }

    // Helper function to format grouped counts (pronouns, prepositions, articles)
    // Sorts results alphabetically and handles cases where none are found.
    function formatGroupCounts(title, counts) {
        let html = `<h4>${title}</h4>`;
        const foundItems = Object.entries(counts); // Get [key, value] pairs

        if (foundItems.length === 0) {
            html += "<ul><li>None found in the text.</li></ul>";
        } else {
            // Sort alphabetically by the word (key)
            foundItems.sort((a, b) => a[0].localeCompare(b[0]));

            html += "<ul>";
            foundItems.forEach(([key, count]) => {
                html += `<li>${key}: ${count}</li>`;
            });
            html += "</ul>";
        }
        html += "<hr>"; // Add separator after each section
        return html;
    }


    // --- Form Submission Simulation (Code kept but likely inert if form removed/changed) ---
    // const contactForm = document.getElementById('contactForm');
    // if (contactForm) {
    //     contactForm.addEventListener('submit', function(event) {
    //         event.preventDefault(); // Prevent actual submission
    //         console.log("Form submission intercepted (simulation).");
    //         // Add logic here if you want to handle form data with JS (e.g., using Fetch API)
    //         // Display a success message, clear the form, etc.
    //         alert("Message sent (simulated)!"); // Simple feedback
    //         contactForm.reset(); // Clear the form fields
    //     });
    // }

}); // End DOMContentLoaded