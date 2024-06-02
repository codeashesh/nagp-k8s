let loadInterval;

function startLoad(duration, step) {
    if (loadInterval) clearInterval(loadInterval);
    loadInterval = setInterval(() => {
    const endTime = Date.now() + duration;
    while (Date.now() < endTime) {
        // Generating CPU load
        console.log(`Generating load on user service...`);
        Math.random();
    }
    }, step);
}

function stopLoad() {
    if (loadInterval) clearInterval(loadInterval);
    console.log(`Load generation on user service stopped...`);
}

function decreaseLoad(step) {
    if (loadInterval) {
        clearInterval(loadInterval);
        startLoad(0, step);
        console.log(`Decreasing load on user service...`);
    }
}

module.exports = {
    startLoad,
    stopLoad,
    decreaseLoad,
};