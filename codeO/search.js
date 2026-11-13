// Global state variables for navigation
let currentMatchIndex = 0;
let allHighlights = [];

function clearHighlights() {
    const containers = document.querySelectorAll('.info-section-common');
    
    containers.forEach(container => {
        const highlightedMarks = container.querySelectorAll('mark.highlight');

        highlightedMarks.forEach(mark => {
            const textNode = document.createTextNode(mark.textContent);
            mark.parentNode.replaceChild(textNode, mark);
        });

        container.normalize();
    });

    // Reset state
    allHighlights = [];
    currentMatchIndex = 0;

    const statusEl = document.getElementById('searchStatus');
    if (statusEl) statusEl.textContent = '';
}

function performSearch() {
    clearHighlights();

    const query = document.getElementById('searchInput').value.trim();
    const statusEl = document.getElementById('searchStatus');

    if (!query) {
        statusEl.textContent = 'Please enter a word to search.';
        return;
    }

    const containers = document.querySelectorAll('.info-section-common');
    if (containers.length === 0) {
        statusEl.textContent = 'Search container (.info-section-common) not found.';
        return;
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    containers.forEach(container => {
        const treeWalker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const matchedNodes = [];
        let currentNode;

        while ((currentNode = treeWalker.nextNode())) {
            if (regex.test(currentNode.textContent)) {
                matchedNodes.push(currentNode);
            }
        }

        matchedNodes.forEach(node => {
            const parent = node.parentNode;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            node.textContent.replace(regex, (match, p1, offset) => {
                if (offset > lastIndex) {
                    fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex, offset)));
                }

                const mark = document.createElement('mark');
                mark.className = 'highlight';
                mark.textContent = match;
                fragment.appendChild(mark);

                lastIndex = offset + match.length;
            });

            if (lastIndex < node.textContent.length) {
                fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex)));
            }

            parent.replaceChild(fragment, node);
        });
    });

    // Collect all highlights across all containers
    allHighlights = Array.from(document.querySelectorAll('mark.highlight'));

    if (allHighlights.length === 0) {
        statusEl.textContent = 'No matches found.';
        return;
    }

    currentMatchIndex = 0;
    updateActiveMatch();
}

// Jump to Next Match (>)
function nextMatch() {
    if (allHighlights.length === 0) return;
    currentMatchIndex = (currentMatchIndex + 1) % allHighlights.length;
    updateActiveMatch();
}

// Jump to Previous Match (<)
function prevMatch() {
    if (allHighlights.length === 0) return;
    currentMatchIndex = (currentMatchIndex - 1 + allHighlights.length) % allHighlights.length;
    updateActiveMatch();
}

// Highlight active match distinctly and scroll into view
function updateActiveMatch() {
    allHighlights.forEach((el, index) => {
        if (index === currentMatchIndex) {
            el.classList.add('active');
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            el.classList.remove('active');
        }
    });

    const statusEl = document.getElementById('searchStatus');
    if (statusEl) {
        statusEl.textContent = `Match ${currentMatchIndex + 1} of ${allHighlights.length}`;
    }
}

// Allow pressing "Enter" in input box to trigger search
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}