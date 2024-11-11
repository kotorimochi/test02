async function startVideo() {
    try {
        const video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (error) {
        console.error("カメラにアクセスできませんでした:", error);
    }
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
])
.then(startVideo)
.catch(error => {
    console.error("face-api.jsのモデルの読み込みに失敗しました:", error);
});

const expressionCounts = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0
};

document.getElementById('startButton2').addEventListener('click', () => {
    const video = document.getElementById('video');
    const resultsDiv = document.getElementById('results');

    for (let key in expressionCounts) {
        expressionCounts[key] = 0;
    }

    const start = Date.now();
    const duration = 10000;

    const interval = setInterval(async () => {
        const elapsed = Date.now() - start;
        if (elapsed > duration) {
            clearInterval(interval);
            displayResults();
            return;
        }

        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (detections && detections.expressions) {
            const maxExpression = getDominantExpression(detections.expressions);
            expressionCounts[maxExpression]++;
        }
    }, 200);
});

function getDominantExpression(expressions) {
    return Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
}

function displayResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h3>表情分析結果：</h3>';
    for (let expression in expressionCounts) {
        resultsDiv.innerHTML += `<p>${expression}: ${expressionCounts[expression]}回</p>`;
    }
}
