let examQuestions = [];
let currentIdx = 0;
let userAnswers = {};
let timeLeft = 2400;
let securityWarnings = 0;

window.onblur = function() {
    securityWarnings++;
    if(securityWarnings >= 3) {
        alert("SECURITY BREACH: Multiple tab switches detected. Auto-submitting...");
        finishExam();
    } else {
        alert(`SECURITY WARNING: You left the exam screen! (${securityWarnings}/3 Warnings)`);
    }
};

function startExam() {
    const name = document.getElementById('student-name').value;
    if(!name) return alert("Full Name Required!");

   // CHANGE THIS SECTION INSIDE startExam()
examQuestions = [];
for(let subject in masterBank) {
    // This picks 20 questions from each of your 4 subjects (Total 80)
    let shuffled = masterBank[subject].sort(() => 0.5 - Math.random());
    examQuestions.push(...shuffled.slice(0, 20)); 
}
examQuestions.sort(() => 0.5 - Math.random());

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');
    document.getElementById('exam-controls').classList.remove('hidden');

    const timer = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft/60), s = timeLeft % 60;
        const box = document.getElementById('timer-box');
        box.innerText = `${m}:${s<10?'0':''}${s}`;
        if(timeLeft < 300) box.classList.add('low-time');
        if(timeLeft <= 0) { clearInterval(timer); finishExam(); }
    }, 1000);

    renderQuestion();
}

function renderQuestion() {
    const q = examQuestions[currentIdx];
    document.getElementById('q-number').innerText = `Question ${currentIdx + 1} of 80`;
    document.getElementById('q-text').innerText = q.q;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = "";
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = 'option-card' + (userAnswers[currentIdx] === opt ? ' selected' : '');
        btn.onclick = () => { userAnswers[currentIdx] = opt; renderQuestion(); };
        grid.appendChild(btn);
    });

    document.getElementById('next-btn').classList.toggle('hidden', currentIdx === examQuestions.length - 1);
    document.getElementById('submit-btn').classList.toggle('hidden', currentIdx !== examQuestions.length - 1);
}

function navigate(dir) {
    currentIdx += dir;
    renderQuestion();
}

function finishExam() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let score = 0;
    examQuestions.forEach((q, i) => { if(userAnswers[i] === q.a) score++; });
    
    const name = document.getElementById('student-name').value;
    const date = new Date().toLocaleString();

    // --- PDF DESIGN ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("IBEJU SENIOR HIGH SCHOOL", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("EXAMINATION REPORT", 105, 30, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35); // Horizontal line

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Candidate Name: ${name}`, 20, 50);
    doc.text(`Date of Exam: ${date}`, 20, 60);
    doc.text(`Total Questions: 80`, 20, 70);
    doc.text(`Security Warnings: ${securityWarnings}`, 20, 80);

    // Score Box
    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(20, 90, 170, 20, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`FINAL SCORE: ${score} / 80 (${((score/80)*100).toFixed(1)}%)`, 105, 103, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("This result is generated electronically. Any alteration renders it invalid.", 105, 130, { align: "center" });

    // --- SAVE AND REDIRECT ---
    doc.save(`${name}_Result.pdf`);

    // Still send WhatsApp for your own records
    const phone = "2347082828150";
    const report = `*IBEJU RESULT*%0A*Candidate:* ${name}%0A*Score:* ${score}/80%0A*Security:* ${securityWarnings}`;
    window.location.href = `https://wa.me/${phone}?text=${report}`;
}