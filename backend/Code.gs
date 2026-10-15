/**
 * PARES backend (Google Apps Script, draait als web-app op Simons Google-account).
 * Opslag: Google Sheet "PARES data" (tabs Inschrijvingen, Insturen, Reacties) en Drive-map "PARES insturen".
 *
 * Eenmalig: voer setup() uit in de editor. Daarna publiceren als web-app:
 * uitvoeren als "Ik", toegang "Iedereen". De URL komt in src/data/community.ts.
 *
 * Publiek (vanaf de site):  subscribe, submit, comment (POST, text/plain JSON) en comments (GET).
 * Links in mails:           confirm, unsubscribe (GET).
 * Beheer (met ADMIN_TOKEN): send, stats, review, hide (POST).
 */

const PROPS = PropertiesService.getScriptProperties();
const SITE = 'https://paresfootball.com';
const AFZENDER = 'PARES';

function setup() {
  let id = PROPS.getProperty('SHEET_ID');
  if (!id) {
    const ss = SpreadsheetApp.create('PARES data');
    id = ss.getId();
    const eerste = ss.getSheets()[0];
    eerste.setName('Inschrijvingen');
    eerste.appendRow(['datum', 'email', 'naam', 'status', 'token', 'bron']);
    ss.insertSheet('Insturen').appendRow(['datum', 'naam', 'email', 'soort', 'plaats', 'titel', 'verhaal', 'foto', 'toestemming']);
    ss.insertSheet('Reacties').appendRow(['datum', 'pagina', 'naam', 'tekst', 'zichtbaar', 'id']);
    PROPS.setProperty('SHEET_ID', id);
  }
  if (!PROPS.getProperty('FOLDER_ID')) {
    PROPS.setProperty('FOLDER_ID', DriveApp.createFolder('PARES insturen').getId());
  }
  if (!PROPS.getProperty('ADMIN_TOKEN')) {
    PROPS.setProperty('ADMIN_TOKEN', Utilities.getUuid());
  }
  Logger.log('SHEET_ID=' + id);
  Logger.log('ADMIN_TOKEN=' + PROPS.getProperty('ADMIN_TOKEN'));
  Logger.log('Mail-quotum vandaag: ' + MailApp.getRemainingDailyQuota());
}

/* ---------- hulpjes ---------- */

function blad(naam) {
  return SpreadsheetApp.openById(PROPS.getProperty('SHEET_ID')).getSheetByName(naam);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function schoon(s, max) {
  return String(s || '').replace(/[<>]/g, '').replace(/\s+\n/g, '\n').trim().slice(0, max);
}

function geldigEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function eigenaar() {
  return Session.getEffectiveUser().getEmail();
}

function webUrl() {
  return ScriptApp.getService().getUrl();
}

function pagina(titel, tekst) {
  const html =
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<div style="font-family:system-ui,sans-serif;max-width:540px;margin:14vh auto;padding:0 20px;color:#0b0b0b">' +
    '<p style="color:#7a1f2e;font-weight:600">PARES</p>' +
    '<h1 style="font-size:44px;letter-spacing:-.03em;line-height:1;margin:0 0 20px">' + titel + '</h1>' +
    '<p style="font-size:18px;line-height:1.6">' + tekst + '</p>' +
    '<p><a href="' + SITE + '" style="color:#0b0b0b;font-weight:600">Naar paresfootball.com</a></p></div>';
  return HtmlService.createHtmlOutput(html).setTitle(titel + ' · PARES');
}

function mailHtml(inhoud, voet) {
  return (
    '<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0b0b0b;line-height:1.6;font-size:16px">' +
    '<p style="font-weight:700;letter-spacing:.02em;border-bottom:1px solid #0b0b0b;padding-bottom:12px">PARES <span style="color:#7a1f2e;font-weight:600">· Pares in campo</span></p>' +
    inhoud +
    (voet ? '<p style="font-size:13px;color:#5c5c5c;border-top:1px solid #ddd;padding-top:12px;margin-top:32px">' + voet + '</p>' : '') +
    '</div>'
  );
}

/* ---------- GET ---------- */

function doGet(e) {
  const p = (e && e.parameter) || {};

  if (p.action === 'comments') {
    const rijen = blad('Reacties').getDataRange().getValues().slice(1);
    const reacties = rijen
      .filter(function (r) { return r[1] === p.page && r[4] === true; })
      .map(function (r) { return { datum: r[0], naam: r[2], tekst: r[3] }; });
    return json({ ok: true, reacties: reacties });
  }

  if ((p.action === 'confirm' || p.action === 'unsubscribe') && p.token) {
    const sh = blad('Inschrijvingen');
    const rijen = sh.getDataRange().getValues();
    for (let i = 1; i < rijen.length; i++) {
      if (rijen[i][4] === p.token) {
        if (p.action === 'confirm') {
          sh.getRange(i + 1, 4).setValue('actief');
          return pagina('Je staat erop.', 'Bedankt. Vanaf nu krijg je de PARES-brief: om de twee weken het mooiste van het veld, in je inbox.');
        }
        sh.getRange(i + 1, 4).setValue('uitgeschreven');
        return pagina('Je bent uitgeschreven.', 'Je krijgt de PARES-brief niet meer. Het veld blijft gewoon open, je bent altijd welkom terug.');
      }
    }
    return pagina('Deze link werkt niet.', 'Misschien is hij al gebruikt. Probeer het opnieuw via de site.');
  }

  return json({ ok: true, service: 'PARES' });
}

/* ---------- POST ---------- */

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, fout: 'Ongeldig verzoek.' });
  }
  if (d.website) return json({ ok: true }); // honeypot: bots vullen dit veld in
  if (d.t && Date.now() - Number(d.t) < 2500) return json({ ok: true }); // te snel ingevuld

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (d.action) {
      case 'subscribe': return inschrijven(d);
      case 'submit': return insturen(d);
      case 'comment': return reageren(d);
      case 'send': return beheer(d) || versturen(d);
      case 'stats': return beheer(d) || statistiek();
      case 'review': return beheer(d) || overzicht();
      case 'hide': return beheer(d) || verbergen(d);
    }
  } finally {
    lock.releaseLock();
  }
  return json({ ok: false, fout: 'Onbekende actie.' });
}

function beheer(d) {
  if (d.token !== PROPS.getProperty('ADMIN_TOKEN')) return json({ ok: false, fout: 'Geen toegang.' });
  return null;
}

/* ---------- nieuwsbrief ---------- */

function inschrijven(d) {
  const email = schoon(d.email, 200).toLowerCase();
  if (!geldigEmail(email)) return json({ ok: false, fout: 'Dit e-mailadres klopt niet helemaal.' });
  const sh = blad('Inschrijvingen');
  const rijen = sh.getDataRange().getValues();
  let rij = -1;
  for (let i = 1; i < rijen.length; i++) if (rijen[i][1] === email) rij = i + 1;
  if (rij > 0 && sh.getRange(rij, 4).getValue() === 'actief') return json({ ok: true, al: true });

  const token = Utilities.getUuid();
  if (rij > 0) {
    sh.getRange(rij, 4, 1, 2).setValues([['wacht', token]]);
  } else {
    sh.appendRow([new Date(), email, schoon(d.naam, 80), 'wacht', token, schoon(d.bron, 120)]);
  }
  const link = webUrl() + '?action=confirm&token=' + token;
  MailApp.sendEmail({
    to: email,
    name: AFZENDER,
    subject: 'Bevestig je inschrijving voor de PARES-brief',
    htmlBody: mailHtml(
      '<h1 style="font-size:30px;letter-spacing:-.02em;line-height:1.1">Nog één klik.</h1>' +
        '<p>Je hebt je aangemeld voor de PARES-brief: om de twee weken het mooiste van het veld. Klik op de knop om het te bevestigen.</p>' +
        '<p><a href="' + link + '" style="display:inline-block;background:#0b0b0b;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">Ja, ik doe mee</a></p>',
      'Heb je je niet aangemeld? Dan kun je deze mail negeren.'
    ),
  });
  return json({ ok: true });
}

function versturen(d) {
  const onderwerp = schoon(d.onderwerp, 200);
  const inhoud = String(d.html || '');
  if (!onderwerp || !inhoud) return json({ ok: false, fout: 'Onderwerp en inhoud zijn nodig.' });
  const rijen = blad('Inschrijvingen').getDataRange().getValues().slice(1);
  let ontvangers = rijen.filter(function (r) { return r[3] === 'actief'; });
  if (d.test) ontvangers = [[new Date(), eigenaar(), '', 'actief', 'test']];
  if (ontvangers.length > MailApp.getRemainingDailyQuota()) return json({ ok: false, fout: 'Mail-quotum van vandaag is te laag.' });
  ontvangers.forEach(function (r) {
    const uit = webUrl() + '?action=unsubscribe&token=' + r[4];
    MailApp.sendEmail({
      to: r[1],
      name: AFZENDER,
      subject: onderwerp,
      htmlBody: mailHtml(inhoud, 'Je krijgt deze mail omdat je je hebt aangemeld op paresfootball.com. <a href="' + uit + '" style="color:#5c5c5c">Uitschrijven</a>'),
    });
  });
  return json({ ok: true, verstuurd: ontvangers.length });
}

/* ---------- insturen ---------- */

function insturen(d) {
  const verhaal = schoon(d.verhaal, 5000);
  if (verhaal.length < 10) return json({ ok: false, fout: 'Vertel iets meer, minstens een paar zinnen.' });
  const email = schoon(d.email, 200);
  if (email && !geldigEmail(email)) return json({ ok: false, fout: 'Dit e-mailadres klopt niet helemaal.' });

  let foto = '';
  if (d.foto && /^data:image\/(jpeg|png|webp);base64,/.test(d.foto) && d.foto.length < 8000000) {
    const delen = d.foto.split(',');
    const type = delen[0].match(/data:(.*);base64/)[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(delen[1]), type, 'insturing-' + Date.now() + '.' + type.split('/')[1]);
    foto = DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID')).createFile(blob).getUrl();
  }
  const rij = [new Date(), schoon(d.naam, 80), email, schoon(d.soort, 40), schoon(d.plaats, 120), schoon(d.titel, 160), verhaal, foto, d.toestemming ? 'ja' : 'nee'];
  blad('Insturen').appendRow(rij);
  MailApp.sendEmail({
    to: eigenaar(),
    name: AFZENDER,
    subject: 'PARES: nieuwe insturing (' + rij[3] + ')',
    htmlBody: mailHtml('<p><b>' + rij[5] + '</b><br>' + rij[1] + ' · ' + rij[4] + '</p><p>' + verhaal.replace(/\n/g, '<br>') + '</p>' + (foto ? '<p><a href="' + foto + '">Foto bekijken</a></p>' : ''), ''),
  });
  return json({ ok: true });
}

/* ---------- reacties ---------- */

function reageren(d) {
  const pag = String(d.page || '');
  if (!/^[a-z0-9-]{1,120}$/.test(pag)) return json({ ok: false, fout: 'Onbekende pagina.' });
  const naam = schoon(d.naam, 60);
  const tekst = schoon(d.tekst, 1500);
  if (!naam || tekst.length < 2) return json({ ok: false, fout: 'Vul je naam en een reactie in.' });
  if ((tekst.match(/https?:\/\//g) || []).length > 1) return json({ ok: false, fout: 'Maximaal één link per reactie.' });
  const id = Utilities.getUuid().slice(0, 8);
  blad('Reacties').appendRow([new Date(), pag, naam, tekst, true, id]);
  MailApp.sendEmail({
    to: eigenaar(),
    name: AFZENDER,
    subject: 'PARES: nieuwe reactie op ' + pag,
    htmlBody: mailHtml('<p><b>' + naam + '</b> op <a href="' + SITE + '/verhalen/' + pag + '/">' + pag + '</a>:</p><p>' + tekst.replace(/\n/g, '<br>') + '</p><p style="color:#5c5c5c">Reactie-id: ' + id + '</p>', ''),
  });
  return json({ ok: true, reactie: { datum: new Date(), naam: naam, tekst: tekst } });
}

function verbergen(d) {
  const sh = blad('Reacties');
  const rijen = sh.getDataRange().getValues();
  for (let i = 1; i < rijen.length; i++) {
    if (rijen[i][5] === d.id) {
      sh.getRange(i + 1, 5).setValue(false);
      return json({ ok: true });
    }
  }
  return json({ ok: false, fout: 'Niet gevonden.' });
}

/* ---------- beheer ---------- */

function statistiek() {
  const ins = blad('Inschrijvingen').getDataRange().getValues().slice(1);
  return json({
    ok: true,
    inschrijvingen: { actief: ins.filter(function (r) { return r[3] === 'actief'; }).length, wacht: ins.filter(function (r) { return r[3] === 'wacht'; }).length, uitgeschreven: ins.filter(function (r) { return r[3] === 'uitgeschreven'; }).length },
    insturingen: blad('Insturen').getLastRow() - 1,
    reacties: blad('Reacties').getLastRow() - 1,
    mailQuotum: MailApp.getRemainingDailyQuota(),
  });
}

function overzicht() {
  return json({
    ok: true,
    insturen: blad('Insturen').getDataRange().getValues().slice(1).slice(-50),
    reacties: blad('Reacties').getDataRange().getValues().slice(1).slice(-100),
  });
}
