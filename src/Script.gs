const INTERVIEWS_SHEET = "finaldata";
const QUESTIONS_SHEET = "questions";
const OTP_EXPIRY_MINUTES = 10;
const SHEET_ID = '1xDBRXl4UHONlCJswZr2iU6ZiYCBBsOYpsEFMIAFKbCc';

const DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE"; // Set your Drive folder ID

const FRONTEND_URL = "https://hiremind-ai-iota.vercel.app/interview/login";
const VIDEO_URL = "https://drive.google.com/file/d/YOUR_VIDEO_ID/view?usp=sharing"; // Add intro video

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: "HireMind AI Interview API is running - Sheet Qs for AI." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "generateLinks") return respond(generateInterviewLinksForPending());

    if (action === "sendOTP") return respond(sendOTP(body.email, body.interviewId));
    if (action === "verifyOTP") return respond(verifyOTP(body.email, body.otp, body.interviewId));
    if (action === "getInterviewData") return respond(getInterviewData(body.interviewId));
    if (action === "saveResult") return respond(saveResult(body));
    if (action === "uploadAudio") return respond(uploadAudioToDrive(
      body.base64Data, body.fileName, body.mimeType, body.candidateName, body.interviewId
    ));
    if (action === "tts") return respond(ttsSynthesize(body.text, body.lang || 'hi-IN'));

    // Keep old
    const oldAction = body.action || '';
    if (oldAction === "send_otp") return sendOtp_({action: oldAction, email: body.email});
    if (oldAction === "verify_otp") return verifyOtp_({action: oldAction, email: body.email, otp: body.otp});

    return respond({ success: false, message: "Unknown action" });
  } catch (err) {
    return respond({ success: false, message: err.toString() });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeadersAndCols_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const cols = {};
  headers.forEach((h, i) => cols[h.trim()] = i + 1);
  return { headers, cols };
}

function handleCandidateCreated_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const candidate = body.candidate;
    if (!candidate || !candidate.email) return json_({ ok: false, error: "Missing data" });
    
    const email = normalizeEmail_(candidate.email);
    const sheet = getSheet_();
    const { cols } = getHeadersAndCols_(sheet);
    
    const row = findRowByEmail_(email);
    const values = [
      candidate.name || '',
      email,
      candidate.interviewId || '',
      new Date(), // CreatedAt
      candidate.status || 'Pending',
      candidate.interviewLink || '',
      candidate.score || '',
      candidate.strengths || '',
      candidate.weaknesses || '',
      candidate.recommendation || '',
      '', // VerifiedAt
      '', // AudioDriveLink
      candidate.totalQuestions || 12,
      '', // CompletedAt
    ];

    if (row) {
      const numCols = Math.max(cols.InterviewLink || 12, values.length);
      sheet.getRange(row, 1, 1, numCols).setValues([values]);
    } else {
      sheet.appendRow(values);
    }
    return json_({ ok: true, message: "Synced", email, row });
  } finally {
    lock.releaseLock();
  }
}

function handleCandidatesSync_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const candidates = body.candidates || [];
    let updated = 0;
    const sheet = getSheet_();
    for (const candidate of candidates) {
      const email = normalizeEmail_(candidate.email);
      const row = findRowByEmail_(email);
      if (row) {
        // Update as above
        const data = [
          candidate.name || '', email, '', new Date(),
          candidate.status || 'Pending', candidate.interviewLink || '',
          candidate.score ? Number(candidate.score) : '', candidate.strengths || '',
          candidate.weaknesses || '', candidate.recommendation || '',
          candidate.technicalRating ? Number(candidate.technicalRating) : '',
          candidate.communicationRating ? Number(candidate.communicationRating) : '',
          candidate.confidenceRating ? Number(candidate.confidenceRating) : '',
          candidate.interviewDate || '',
          candidate.audioLinks ? JSON.stringify(candidate.audioLinks) : ''
        ];
        sheet.getRange(row, 1, 1, 15).setValues([data]);
        updated++;
      }
    }
    return json_({ ok: true, message: `Synced ${updated}/${candidates.length}`, count: candidates.length });
  } finally {
    lock.releaseLock();
  }
}

function handleInterviewCompleted_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const email = normalizeEmail_(body.candidateEmail || '');
    if (!email) return json_({ ok: false, error: "Missing candidateEmail" });
    const row = findRowByEmail_(email);
    if (!row) return json_({ ok: false, error: "Candidate not found" });
    const sheet = getSheet_();
    const eval_ = body.evaluation;
    sheet.getRange(row, 5).setValue('Completed'); // E: Status
    sheet.getRange(row, 7).setValue(eval_.score ? Number(eval_.score) : ''); // G: Score
    sheet.getRange(row, 8).setValue(eval_.strengths || ''); // H
    sheet.getRange(row, 9).setValue(eval_.weaknesses || ''); // I
    sheet.getRange(row, 10).setValue(eval_.recommendation || ''); // J
    sheet.getRange(row, 11).setValue(eval_.technicalRating ? Number(eval_.technicalRating) : ''); // K
    sheet.getRange(row, 12).setValue(eval_.communicationRating ? Number(eval_.communicationRating) : ''); // L
    sheet.getRange(row, 13).setValue(eval_.confidenceRating ? Number(eval_.confidenceRating) : ''); // M
    sheet.getRange(row, 14).setValue(new Date()); // N: interviewDate
    sheet.getRange(row, 3).setValue(''); // Clear OTP if any
    console.log(`Completed interview for ${email}, row ${row}`);
    return json_({ ok: true, message: "Interview results synced", email });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_(name = INTERVIEWS_SHEET) {
  try {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
  } catch (e) {
    throw new Error('Sheet not found: ' + name);
  }
}

function findRowByEmail_(email) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('CandidateEmail');
  if (emailCol === -1) throw new Error('CandidateEmail column not found');
  
  const emails = data.slice(1).map(row => String(row[emailCol] || '').trim().toLowerCase());
  const rowIndex = emails.indexOf(email) + 2; // 1-based + header
  return rowIndex <= data.length ? rowIndex : null;
}

function sendOtp_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const email = normalizeEmail_(body.email || "");
    validateEmail_(email);

    const row = findRowByEmail_(email);
    if (!row) {
      return json_({
        ok: false,
        error: 'User not registered',
      });
    }

    // Check cooldown (sheet-based)
    const cooldownCell = getSheet_().getRange(row, 4); // Col D: last sent timestamp
    const lastSent = cooldownCell.getValue();
    const now = new Date().getTime();
    if (lastSent && (now - lastSent.getTime()) / 1000 < RESEND_COOLDOWN_SECONDS) {
      const remaining = Math.ceil((RESEND_COOLDOWN_SECONDS - (now - lastSent.getTime()) / 1000));
      return json_({
        ok: false,
        error: `Please wait ${remaining} seconds before requesting a new OTP.`,
      });
    }

    const otp = generateOtp_();
    const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP plain in Col C, expiry in D as Date
    getSheet_().getRange(row, 3).setValue(otp); // Col C: OTP
    getSheet_().getRange(row, 4).setValue(expiresAt); // Col D: expiry

    const subject = "Your HireMind AI Interview OTP";
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Interview Portal OTP</h2>
        <p>Dear Candidate,</p>
        <p>Your 6-digit OTP is: <strong style="font-size:28px;letter-spacing:4px">${otp}</strong></p>
        <p>Valid for ${OTP_EXPIRY_MINUTES} minutes. Interview link: https://hiremind-ai-iota.vercel.app/interview/login</p>
        <p>If not requested, ignore.</p>
      </div>
    `;

    MailApp.sendEmail(email, subject, '', {htmlBody});

    cooldownCell.setValue(new Date(now)); // Update cooldown timestamp

    return json_({
      ok: true,
      message: "OTP sent successfully",
      email,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } finally {
    lock.releaseLock();
  }
}

function verifyOtp_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const email = normalizeEmail_(body.email || "");
    const otp = String(body.otp || "").trim();

    validateEmail_(email);

    if (!/^\d{6}$/.test(otp)) {
      return json_({ ok: false, error: "OTP must be 6 digits" });
    }

    const row = findRowByEmail_(email);
    if (!row) {
      return json_({ ok: false, error: "User not registered" });
    }

    const sheet = getSheet_();
    const storedOtp = sheet.getRange(row, 3).getValue(); // Col C
    const expiresAt = sheet.getRange(row, 4).getValue(); // Col D
    const now = new Date();

    if (!storedOtp || storedOtp !== otp) {
      // Increment attempts? Track in prop or skip for simplicity
      return json_({ ok: false, error: "Invalid OTP" });
    }

    if (now > expiresAt) {
      sheet.getRange(row, 3).setValue(''); // Clear invalid
      return json_({ ok: false, error: "OTP expired" });
    }

    // Success: clear OTP
    sheet.getRange(row, 3).setValue('');
    sheet.getRange(row, 4).setValue(''); // Clear expiry

    const props = PropertiesService.getScriptProperties();
    props.setProperty(verifiedKey_(email), JSON.stringify({
      verified: true,
      verifiedAt: now.toISOString(),
    }));

    return json_({
      ok: true,
      message: "Email verified successfully",
      email,
      verified: true,
    });
  } finally {
    lock.releaseLock();
  }
}

function isVerified_(email) {
  if (!email) return false;
  const raw = PropertiesService.getScriptProperties().getProperty(verifiedKey_(email));
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);
    return Boolean(data.verified);
  } catch (e) {
    return false;
  }
}

function generateOtp_() {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

function validateEmail_(email) {
  if (!email) {
    throw new Error("Email is required");
  }

  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) {
    throw new Error("Invalid email");
  }
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function otpKey_(email) {
  return "otp:" + email;
}

function verifiedKey_(email) {
  return "verified:" + email;
}

function hashOtp_(email, otp) {
  const secret = getSecret_();
  const raw = `${email}|${otp}|${secret}`;
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    raw,
    Utilities.Charset.UTF_8,
  );

  return digest
    .map(function (b) {
      const v = (b + 256) % 256;
      return ("0" + v.toString(16)).slice(-2);
    })
    .join("");
}

function getSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("OTP_SECRET");

  if (!secret) {
    secret = Utilities.getUuid() + "-" + new Date().getTime();
    props.setProperty("OTP_SECRET", secret);
  }

  return secret;
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  return JSON.parse(raw);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
