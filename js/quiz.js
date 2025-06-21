let questions = [];
let selectedQuestions = [];
let userAnswers = [];

// 入力ガイドライン（全問題共通）
const GUIDELINE = {
    multiplier: "半角数字のみ入力してください。\n無い場合は1を入力してください。",
    pulseUnit: "半角数字のみ入力してください。",
    integerDigits: "半角数字のみ入力してください。",
    decimalDigits: "半角数字のみ入力してください。",
    displayUnit: "半角英数字のみ入力してください。",
    serialNumber: "半角英数字のみ入力してください。\n'No.'やスペースは入力不要です。\n不明な場合は'-'を入力してください。",
    inspectionYear: "半角英数字のみ入力してください。\n平成は'H'、昭和は'S'を付けてください。\n不明な場合は'99'を入力してください。",
    inspectionMonth: "半角数字のみ入力してください。\n不明な場合は'99'を入力してください。",
    displayValue: "半角数字のみ入力してください。"
};

// データの読み込み
async function loadQuestions() {
    try {
        const response = await fetch('json/data.json');
        const data = await response.json();
        questions = data.questions;
        startQuiz();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// ランダムに3問を選択
function selectRandomQuestions() {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// クイズの開始
function startQuiz() {
    // ページ最上部にスクロール（即時実行）
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // 少し遅延させてから問題を表示
    setTimeout(() => {
        selectedQuestions = selectRandomQuestions();
        userAnswers = [];
        displayQuestions();
        
        // 問題と採点ボタンを表示
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('check-answers').style.display = 'inline-block';
        
        // 結果とアクションボタンを非表示
        document.getElementById('result-container').style.display = 'none';
        document.getElementById('action-buttons').style.display = 'none';
    }, 100);
}

// 問題の表示
function displayQuestions() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    selectedQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        questionDiv.innerHTML = `
            <h3>問題 ${index + 1}</h3>
            <p>次のメーターの仕様を答えなさい。</p>
            <div class="row">
                <div class="col-md-6">
                    <img src="${question.meterImage}" alt="メーター画像" class="meter-image">
                </div>
                <div class="col-md-6">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">乗率: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.multiplier}</small>
                            <div class="input-group">
                                <span class="input-group-text">x</span>
                                <input type="text" class="form-control" name="multiplier_${index}" required inputmode="decimal" pattern="[0-9]+(\\.[0-9]+)?">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">パルス単位: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.pulseUnit}</small>
                            <div class="input-group">
                                <input type="text" class="form-control" name="pulseUnit_${index}" required inputmode="decimal" pattern="[0-9]+(\\.[0-9]+)?">
                                <span class="input-group-text">${question.pulseUnitDisplay}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">整数部桁数: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.integerDigits}</small>
                            <div class="input-group">
                                <input type="text" class="form-control" name="integerDigits_${index}" required inputmode="numeric" pattern="[0-9]+">
                                <span class="input-group-text">桁</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">小数部桁数: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.decimalDigits}</small>
                            <div class="input-group">
                                <input type="text" class="form-control" name="decimalDigits_${index}" required inputmode="numeric" pattern="[0-9]+">
                                <span class="input-group-text">桁</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">表示単位: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.displayUnit}</small>
                            <input type="text" class="form-control" name="displayUnit_${index}" required inputmode="latin" pattern="[A-Za-z0-9]+">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">製造番号: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.serialNumber}</small>
                            <input type="text" class="form-control" name="serialNumber_${index}" required inputmode="latin" pattern="[A-Za-z0-9\-]+">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">検定期限（年）: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.inspectionYear}</small>
                            <div class="input-group">
                                <input type="text" class="form-control" name="year_${index}" required inputmode="latin" pattern="[A-Za-z0-9]+">
                                <span class="input-group-text">年</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">検定期限（月）: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.inspectionMonth}</small>
                            <div class="input-group">
                                <input type="text" class="form-control" name="month_${index}" required inputmode="numeric" pattern="[0-9]+">
                                <span class="input-group-text">月</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">指針値: </label>
                            <small class="form-text text-muted d-block mb-2" style="white-space: pre-line;">${GUIDELINE.displayValue}</small>
                            <input type="text" class="form-control" name="displayValue_${index}" required inputmode="decimal" pattern="[0-9]+(\\.[0-9]+)?">
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(questionDiv);
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 回答の採点
function checkAnswers() {
    // ページ最上部にスクロール（即時実行）
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // 少し遅延させてから結果を表示
    setTimeout(() => {
        const resultContainer = document.getElementById('result-container');
        resultContainer.innerHTML = '';
        let totalScore = 0;

        // 総合スコアの表示
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'alert alert-info text-center';
        scoreDiv.textContent = `総合スコア: 0点 / 27点`;
        resultContainer.appendChild(scoreDiv);

        selectedQuestions.forEach((question, index) => {
            const userAnswer = {
                multiplier: document.querySelector(`input[name="multiplier_${index}"]`).value,
                pulseUnit: document.querySelector(`input[name="pulseUnit_${index}"]`).value,
                integerDigits: document.querySelector(`input[name="integerDigits_${index}"]`).value,
                decimalDigits: document.querySelector(`input[name="decimalDigits_${index}"]`).value,
                displayUnit: document.querySelector(`input[name="displayUnit_${index}"]`).value,
                serialNumber: document.querySelector(`input[name="serialNumber_${index}"]`).value,
                year: document.querySelector(`input[name="year_${index}"]`).value,
                month: document.querySelector(`input[name="month_${index}"]`).value,
                displayValue: document.querySelector(`input[name="displayValue_${index}"]`).value
            };

            let questionScore = 0;
            const resultDiv = document.createElement('div');
            resultDiv.className = 'question-container';

            // 問題タイトル
            const h3 = document.createElement('h3');
            h3.textContent = `問題 ${index + 1}`;
            resultDiv.appendChild(h3);

            // 問題説明
            const p = document.createElement('p');
            p.textContent = '次のメーターの仕様を答えなさい。';
            resultDiv.appendChild(p);

            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';

            // 画像
            const imgCol = document.createElement('div');
            imgCol.className = 'col-md-6';
            const img = document.createElement('img');
            img.src = question.explanationImage;
            img.alt = '解説画像';
            img.className = 'explanation-image';
            imgCol.appendChild(img);
            rowDiv.appendChild(imgCol);

            // 回答・正解・解説
            const infoCol = document.createElement('div');
            infoCol.className = 'col-md-6';
            const infoRow = document.createElement('div');
            infoRow.className = 'row g-3';

            // 入力内容
            const inputCol = document.createElement('div');
            inputCol.className = 'col-6';
            const inputTitle = document.createElement('h4');
            inputTitle.textContent = '入力内容';
            inputCol.appendChild(inputTitle);
            const ulInput = document.createElement('ul');
            ulInput.className = 'list-unstyled';
            // 各項目
            const items = [
                { label: '乗率', value: `x ${userAnswer.multiplier}`, correct: userAnswer.multiplier === question.multiplier },
                { label: 'パルス単位', value: `${userAnswer.pulseUnit} ${question.pulseUnitDisplay}`, correct: userAnswer.pulseUnit === question.pulseUnit },
                { label: '整数部桁数', value: `${userAnswer.integerDigits} 桁`, correct: userAnswer.integerDigits === question.integerDigits },
                { label: '小数部桁数', value: `${userAnswer.decimalDigits} 桁`, correct: userAnswer.decimalDigits === question.decimalDigits },
                { label: '表示単位', value: userAnswer.displayUnit, correct: userAnswer.displayUnit === question.displayUnit },
                { label: '製造番号', value: userAnswer.serialNumber, correct: userAnswer.serialNumber === question.serialNumber },
                { label: '検定期限（年）', value: `${userAnswer.year} 年`, correct: userAnswer.year === question.inspectionYear },
                { label: '検定期限（月）', value: `${userAnswer.month} 月`, correct: userAnswer.month === question.inspectionMonth },
                { label: '指針値', value: userAnswer.displayValue, correct: userAnswer.displayValue === question.displayValue },
            ];
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.label}: `;
                const span = document.createElement('span');
                span.className = item.correct ? 'correct' : 'incorrect';
                span.textContent = item.value;
                li.appendChild(span);
                ulInput.appendChild(li);
            });
            inputCol.appendChild(ulInput);
            infoRow.appendChild(inputCol);

            // 正解
            const answerCol = document.createElement('div');
            answerCol.className = 'col-6';
            const answerTitle = document.createElement('h4');
            answerTitle.textContent = '正解';
            answerCol.appendChild(answerTitle);
            const ulAnswer = document.createElement('ul');
            ulAnswer.className = 'list-unstyled';
            const answerItems = [
                { label: '乗率', value: `x ${question.multiplier}` },
                { label: 'パルス単位', value: `${question.pulseUnit} ${question.pulseUnitDisplay}` },
                { label: '整数部桁数', value: `${question.integerDigits} 桁` },
                { label: '小数部桁数', value: `${question.decimalDigits} 桁` },
                { label: '表示単位', value: question.displayUnit },
                { label: '製造番号', value: question.serialNumber },
                { label: '検定期限（年）', value: `${question.inspectionYear} 年` },
                { label: '検定期限（月）', value: `${question.inspectionMonth} 月` },
                { label: '指針値', value: question.displayValue },
            ];
            answerItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.label}: ${item.value}`;
                ulAnswer.appendChild(li);
            });
            answerCol.appendChild(ulAnswer);
            infoRow.appendChild(answerCol);

            // 解説
            const hr = document.createElement('hr');
            infoCol.appendChild(infoRow);
            infoCol.appendChild(hr);
            const explanationRow = document.createElement('div');
            explanationRow.className = 'row g-3';
            const explanationCol = document.createElement('div');
            explanationCol.className = 'col';
            const explanationTitle = document.createElement('h4');
            explanationTitle.textContent = '解説';
            explanationCol.appendChild(explanationTitle);
            const explanationTextDiv = document.createElement('div');
            explanationTextDiv.className = 'explanation-text';
            question.explanationText.forEach(text => {
                const p = document.createElement('p');
                p.className = 'mb-2';
                p.textContent = text;
                explanationTextDiv.appendChild(p);
            });
            explanationCol.appendChild(explanationTextDiv);
            explanationRow.appendChild(explanationCol);
            infoCol.appendChild(explanationRow);

            rowDiv.appendChild(infoCol);
            resultDiv.appendChild(rowDiv);

            // スコアの計算（各項目1点、合計27点）
            if (userAnswer.multiplier === question.multiplier) questionScore += 1;
            if (userAnswer.pulseUnit === question.pulseUnit) questionScore += 1;
            if (userAnswer.integerDigits === question.integerDigits) questionScore += 1;
            if (userAnswer.decimalDigits === question.decimalDigits) questionScore += 1;
            if (userAnswer.displayUnit === question.displayUnit) questionScore += 1;
            if (userAnswer.serialNumber === question.serialNumber) questionScore += 1;
            if (userAnswer.year === question.inspectionYear) questionScore += 1;
            if (userAnswer.month === question.inspectionMonth) questionScore += 1;
            if (userAnswer.displayValue === question.displayValue) questionScore += 1;

            totalScore += questionScore;
            resultContainer.appendChild(resultDiv);
        });

        // スコアの更新
        scoreDiv.textContent = `総合スコア: ${totalScore}点 / 27点`;

        // 問題と採点ボタンを非表示
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('check-answers').style.display = 'none';
        
        // 結果とアクションボタンを表示
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'block';
    }, 100);
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    document.getElementById('check-answers').addEventListener('click', checkAnswers);
    document.getElementById('retry').addEventListener('click', startQuiz);
    document.getElementById('finish').addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });
}); 