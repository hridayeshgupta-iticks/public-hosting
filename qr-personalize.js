const elementsMap = {
    '#first-name': [
        { type: 'innerHTML', value: (queryMap) => queryMap.name || 'Hey'}
    ],
    '#company-name': [
        { type: 'innerHTML', value: (queryMap) => queryMap.company || 'Your Company'}
    ]
};

function updateElements(elementsMap, finalMap) {
    // Iterate over the elements map
    for (const selector in finalMap) {
        if (finalMap.hasOwnProperty(selector)) {
            // Select the element using querySelector
            const element = document.querySelector(selector);
            if (!element) {
                console.log('Element with selector', selector, 'not found.');
                continue;
            }
            // Apply updates based on the final map
            const updateRules = finalMap[selector];
            for (const rule of updateRules) {
                const { type, value } = rule;

                // Check if value exists
                const updatedValue = typeof value === 'function' ? value(queryParamsMap) : value;

                // Apply update based on the specified type
                if (type === 'innerHTML') {
                    element.innerHTML = updatedValue;
                } else if (type === 'src') {
                    element.src = updatedValue;
                } else if (type === 'srcset') {
                    element.srcset = updatedValue;
                } else if (type === 'css') {
                    // Split multiple CSS properties and values
                    const properties = updatedValue.split(';').filter(Boolean);
                    properties.forEach(property => {
                        const [prop, val] = property.split(':').map(item => item.trim());
                        element.style[prop] = val;
                    });
                } else {
                    console.warn('Invalid update type or element type:', type, element.tagName);
                }
            }
        }
    }
}

function preprocessElementsMap(elementsMap, queryParamsMap) {
    const processedMap = {};
    for (const selector in elementsMap) {
        if (!elementsMap.hasOwnProperty(selector)) {
            continue;
        }
        const rules = elementsMap[selector];
        const processedRules = [];
        for (const rule of rules) {
            let updatedValue;
            if (typeof rule.value === 'function') {
                updatedValue = rule.value(queryParamsMap) || '';
            } else {
                updatedValue = rule.value;
            }
            if(!updatedValue) continue;
            processedRules.push({ type: rule.type, value: updatedValue });
        }
        processedMap[selector] = processedRules;
    }
    return processedMap;
}

// Call the function to update elements
function getDataMap() {
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const queryParamsMap = {};
    for (const [key, value] of urlParams.entries()) {
        queryParamsMap[key] = value;
    }
    return queryParamsMap;
}
function hideDoc() {
    let styleEle = document.createElement('style');
    styleEle.id = 'qr-styles';
    styleEle.append(document.createTextNode('html:not([data-qr-loaded]) body { opacity: 0 !important; }'));
    document.head.append(cssStyle);
    return cssStyle;
}
function showDoc() {
    document.documentElement.setAttribute('data-qr-loaded', 'true');
}
(function() {
    const cssStyle = hideDoc();
    const queryParamsMap = getDataMap();
    const finalMap = preprocessElementsMap(elementsMap, queryParamsMap);
    updateElements(elementsMap, finalMap);
    showDoc();
})();
