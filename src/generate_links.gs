function generateInterviewLinksForPending() {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const { cols } = getHeadersAndCols_(sheet);
  
  const now = new Date();
  let updated = 0;

  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    const status = String(rowData[cols.Status - 1] || '').trim();
    const link = String(rowData[cols.InterviewLink - 1] || '').trim();
    
    if (status !== '' || link !== '') continue; // Already has link/status

    const name = String(rowData[cols.CandidateName - 1] || '').trim();
    const email = String(rowData[cols.CandidateEmail - 1] || '').trim();
    const dept = String(rowData[cols.Department - 1] || '').trim();
    const desig = String(rowData[cols.Designation - 1] || '').trim();

    if (!email || !name || !dept || !desig) continue;

    const interviewId = 'INT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const interviewLink = FRONTEND_URL + '?id=' + interviewId;

    // Set cells
    sheet.getRange(i+1, cols.InterviewId).setValue(interviewId);
    sheet.getRange(i+1, cols.Status).setValue('CREATED');
    sheet.getRange(i+1, cols.CreatedAt).setValue(now);
    sheet.getRange(i+1, cols.InterviewLink).setValue(interviewLink);
    sheet.getRange(i+1, cols['Total Questions']).setValue(12);

    // Email
    MailApp.sendEmail({
      to: email,
      subject: "HireMind AI Interview Link Generated",
      htmlBody: `
        <h2>Your Interview Link Ready!</h2>
        <p>Name: ${name}</p>
        <p>Dept: ${dept} | Desig: ${desig}</p>
        <p><a href="${interviewLink}">Start Interview</a></p>
        <p>Status: CREATED</p>
      `
    });

    updated++;
  }
  return { success: true, updated, total: data.length - 1 };
}
