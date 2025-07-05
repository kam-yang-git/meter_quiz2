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
        const [electricityRes, waterRes, gasRes] = await Promise.all([
            fetch('json/electricity.json'),
            fetch('json/water.json'),
            fetch('json/gas.json')
        ]);
        const [electricityData, waterData, gasData] = await Promise.all([
            electricityRes.json(),
            waterRes.json(),
            gasRes.json()
        ]);
        
        function getRandomQuestion(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        selectedQuestions = [
            getRandomQuestion(electricityData.questions),
            getRandomQuestion(waterData.questions),
            getRandomQuestion(gasData.questions)
        ];
        userAnswers = [];
        startQuiz();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// クイズの開始
function startQuiz() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setTimeout(() => {
        displayQuestions();
        
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('check-answers').style.display = 'inline-block';
        
        document.getElementById('result-container').style.display = 'none';
        document.getElementById('action-buttons').style.display = 'none';
    }, 100);
}

// 問題の表示 (XSS対策済み)
function displayQuestions() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = ''; // 既存の内容をクリア

    selectedQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';

        const h3 = document.createElement('h3');
        h3.textContent = `問題 ${index + 1}`;
        questionDiv.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = '次のメーターの仕様を答えなさい。';
        questionDiv.appendChild(p);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        questionDiv.appendChild(rowDiv);

        const imgCol = document.createElement('div');
        imgCol.className = 'col-md-6';
        rowDiv.appendChild(imgCol);

        const meterImage = document.createElement('img');
        // setAttributeを使い、`src`に安全な値のみをセット
        meterImage.setAttribute('src', question.meterImage); 
        meterImage.alt = 'メーター画像';
        meterImage.className = 'meter-image';
        imgCol.appendChild(meterImage);

        const formCol = document.createElement('div');
        formCol.className = 'col-md-6';
        rowDiv.appendChild(formCol);

        const formRow = document.createElement('div');
        formRow.className = 'row g-3';
        formCol.appendChild(formRow);

        // 各入力フィールドの生成を関数化してコードの重複を減らす
        const createInputField = (label, name, guidelineText, inputType, pattern, unit = '') => {
            const col = document.createElement('div');
            col.className = 'col-md-6';

            const labelElem = document.createElement('label');
            labelElem.className = 'form-label';
            labelElem.textContent = `${label}: `;
            col.appendChild(labelElem);

            const small = document.createElement('small');
            small.className = 'form-text text-muted d-block mb-2';
            small.style.whiteSpace = 'pre-line';
            small.textContent = guidelineText; // textContentで安全に挿入
            col.appendChild(small);

            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            col.appendChild(inputGroup);

            if (name.includes('multiplier')) { // 乗率の 'x' プレフィックス
                const span = document.createElement('span');
                span.className = 'input-group-text';
                span.textContent = 'x'; // textContentで安全に挿入
                inputGroup.appendChild(span);
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.name = `${name}_${index}`;
            input.required = true;
            input.inputMode = inputType;
            if (pattern) {
                input.pattern = pattern;
            }
            inputGroup.appendChild(input);

            if (unit) { // 単位がある場合
                const span = document.createElement('span');
                span.className = 'input-group-text';
                span.textContent = unit; // textContentで安全に挿入
                inputGroup.appendChild(span);
            }
            formRow.appendChild(col);
        };

        createInputField('乗率', 'multiplier', GUIDELINE.multiplier, 'decimal', '[0-9]+(\\.[0-9]+)?');
        // question.pulseUnitDisplay はJSONから直接読み込むため、textContentで設定
        const pulseUnitCol = document.createElement('div');
        pulseUnitCol.className = 'col-md-6';
        const pulseUnitLabel = document.createElement('label');
        pulseUnitLabel.className = 'form-label';
        pulseUnitLabel.textContent = 'パルス単位: ';
        pulseUnitCol.appendChild(pulseUnitLabel);
        const pulseUnitSmall = document.createElement('small');
        pulseUnitSmall.className = 'form-text text-muted d-block mb-2';
        pulseUnitSmall.style.whiteSpace = 'pre-line';
        pulseUnitSmall.textContent = GUIDELINE.pulseUnit;
        pulseUnitCol.appendChild(pulseUnitSmall);
        const pulseUnitInputGroup = document.createElement('div');
        pulseUnitInputGroup.className = 'input-group';
        const pulseUnitInput = document.createElement('input');
        pulseUnitInput.type = 'text';
        pulseUnitInput.className = 'form-control';
        pulseUnitInput.name = `pulseUnit_${index}`;
        pulseUnitInput.required = true;
        pulseUnitInput.inputMode = 'decimal';
        pulseUnitInput.pattern = '[0-9]+(\\.[0-9]+)?';
        pulseUnitInputGroup.appendChild(pulseUnitInput);
        const pulseUnitSpan = document.createElement('span');
        pulseUnitSpan.className = 'input-group-text';
        pulseUnitSpan.textContent = question.pulseUnitDisplay; // ここをtextContentで設定
        pulseUnitInputGroup.appendChild(pulseUnitSpan);
        pulseUnitCol.appendChild(pulseUnitInputGroup);
        formRow.appendChild(pulseUnitCol);

        createInputField('整数部桁数', 'integerDigits', GUIDELINE.integerDigits, 'numeric', '[0-9]+', '桁');
        createInputField('小数部桁数', 'decimalDigits', GUIDELINE.decimalDigits, 'numeric', '[0-9]+', '桁');
        createInputField('表示単位', 'displayUnit', GUIDELINE.displayUnit, 'latin', '[A-Za-z0-9]+');
        createInputField('製造番号', 'serialNumber', GUIDELINE.serialNumber, 'latin', '[A-Za-z0-9\\-]+');
        createInputField('検定期限（年）', 'year', GUIDELINE.inspectionYear, 'latin', '[A-Za-z0-9]+', '年');
        createInputField('検定期限（月）', 'month', GUIDELINE.inspectionMonth, 'numeric', '[0-9]+', '月');
        createInputField('指針値', 'displayValue', GUIDELINE.displayValue, 'decimal', '[0-9]+(\\.[0-9]+)?');
        
        container.appendChild(questionDiv);
    });

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 回答の採点（ここは元々textContentを使用しているためXSS対策不要）
function checkAnswers() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setTimeout(() => {
        const resultContainer = document.getElementById('result-container');
        resultContainer.innerHTML = '';
        let totalScore = 0;

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

            const h3 = document.createElement('h3');
            h3.textContent = `問題 ${index + 1}`;
            resultDiv.appendChild(h3);

            const p = document.createElement('p');
            p.textContent = '次のメーターの仕様を答えなさい。';
            resultDiv.appendChild(p);

            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';

            const imgCol = document.createElement('div');
            imgCol.className = 'col-md-6';
            const img = document.createElement('img');
            img.src = question.explanationImage;
            img.alt = '解説画像';
            img.className = 'explanation-image';
            imgCol.appendChild(img);
            rowDiv.appendChild(imgCol);

            const infoCol = document.createElement('div');
            infoCol.className = 'col-md-6';
            const infoRow = document.createElement('div');
            infoRow.className = 'row g-3';

            const inputCol = document.createElement('div');
            inputCol.className = 'col-6';
            const inputTitle = document.createElement('h4');
            inputTitle.textContent = '入力内容';
            inputCol.appendChild(inputTitle);
            const ulInput = document.createElement('ul');
            ulInput.className = 'list-unstyled';
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
                span.textContent = item.value; // textContentで安全に挿入
                li.appendChild(span);
                ulInput.appendChild(li);
            });
            inputCol.appendChild(ulInput);
            infoRow.appendChild(inputCol);

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
                li.textContent = `${item.label}: ${item.value}`; // textContentで安全に挿入
                ulAnswer.appendChild(li);
            });
            answerCol.appendChild(ulAnswer);
            infoRow.appendChild(answerCol);

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
                p.textContent = text; // textContentで安全に挿入
                explanationTextDiv.appendChild(p);
            });
            explanationCol.appendChild(explanationTextDiv);
            explanationRow.appendChild(explanationCol);
            infoCol.appendChild(explanationRow);

            rowDiv.appendChild(infoCol);
            resultDiv.appendChild(rowDiv);

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

        scoreDiv.textContent = `総合スコア: ${totalScore}点 / 27点`;

        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('check-answers').style.display = 'none';
        
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'block';
    }, 100);
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    document.getElementById('check-answers').addEventListener('click', checkAnswers);
    document.getElementById('retry').addEventListener('click', loadQuestions);
    document.getElementById('finish').addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });
});