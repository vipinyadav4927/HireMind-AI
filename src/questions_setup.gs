// Run once to setup Questions sheet
function setupQuestionsSheet() {
  const ss = SpreadsheetApp.openById('1xDBRXl4UHONlCJswZr2iU6ZiYCBBsOYpsEFMIAFKbCc');
  let sheet = ss.getSheetByName('questions');
  if (!sheet) sheet = ss.insertSheet('questions');
  
  // Headers
  sheet.getRange('A1:O1').setValues([['UID', 'Sr. No.', 'Department', 'Designation', 'Type', 'Question', 'Difficulty', 'Status', 'Expected Duration (s)', 'Sample Answer', 'Keywords', 'CreatedAt', 'UpdatedAt', 'Tags', 'Notes']]);
  
  // Sample Qs - Add your dept/desig Qs
  const sampleData = [
    ['Q1', 1, 'Engineering', 'Software Engineer', 'Technical', 'Explain OOP concepts with examples.', 'Medium', 'live', 120, '', 'OOP,class,inheritance', new Date(), new Date(), 'Core', ''],
    // Add 50+ Qs per dept/desig
  ];
  if (sampleData.length > 0) sheet.getRange(2, 1, sampleData.length, 15).setValues(sampleData);
  
  sheet.setFrozenRows(1);
  console.log('Questions sheet ready!');
}
