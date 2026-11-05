import fs from 'fs';
import path from 'path';

const sourceCsvPath = 'C:/Users/Asus/.gemini/antigravity/brain/e24a9df3-7d43-4ae0-bb03-4fad5559c7b7/.user_uploaded/media_1793876105025_ba136fe8.csv';
const outputDir = path.resolve('data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const rawContent = fs.readFileSync(sourceCsvPath, 'utf8');
const lines = rawContent.trim().split('\n');

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function generateRealisticIPK(i) {
  const mod = i % 100;
  let ipk;
  if (mod < 50) {
    const base = 3.00;
    const offset = ((i * 7 + 13) % 99) / 100;
    ipk = (base + offset * 0.98).toFixed(2);
    if (parseFloat(ipk) > 4.00) ipk = '4.00';
  } else if (mod < 75) {
    const base = 2.50;
    const offset = ((i * 11 + 7) % 49) / 100;
    ipk = (base + offset).toFixed(2);
  } else if (mod < 90) {
    const base = 2.00;
    const offset = ((i * 13 + 5) % 49) / 100;
    ipk = (base + offset).toFixed(2);
  } else if (mod < 96) {
    const base = 1.50;
    const offset = ((i * 17 + 3) % 49) / 100;
    ipk = (base + offset).toFixed(2);
  } else {
    const base = 1.10;
    const offset = ((i * 19 + 2) % 38) / 100;
    ipk = (base + offset).toFixed(2);
  }

  const numIpk = parseFloat(ipk);
  let maksSks = 12;
  if (numIpk >= 3.00) maksSks = 24;
  else if (numIpk >= 2.50) maksSks = 21;
  else if (numIpk >= 2.00) maksSks = 18;
  else if (numIpk >= 1.50) maksSks = 15;

  return { ipk, maksSks };
}

function buildCsvForUser(userName, userNim, userRole) {
  const header = 'nim,nama,email,tahun_masuk,status,kode_prodi,id_dosen_pa,no_hp,ips_lalu,maks_sks,kontributor,peran_tim';
  const outLines = [header];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCsvLine(line);
    const { ipk, maksSks } = generateRealisticIPK(i - 1);

    const nim = cols[0];
    const nama = cols[1];
    const email = cols[2];
    const tahunMasuk = cols[3];
    const status = cols[4];
    const kodeProdi = cols[5];
    const idDosenPa = cols[6];
    const noHp = cols[7];

    outLines.push(`${nim},"${nama}",${email},${tahunMasuk},${status},${kodeProdi},${idDosenPa},${noHp},${ipk},${maksSks},"${userName} (${userNim})","${userRole}"`);
  }
  return outLines.join('\n');
}

// 1. Dataset 1000 Khusus Naysilla Sifa Aprilianissa (Repo Owner / Backend Dev)
const csvNaysilla = buildCsvForUser('Naysilla Sifa Aprilianissa', '2450231059', 'Backend Developer');
fs.writeFileSync(path.join(outputDir, 'dataset_1000_naysilla.csv'), csvNaysilla, 'utf8');

// 2. Dataset 1000 Khusus Anita Nurhayati (DBA)
const csvAnita = buildCsvForUser('Anita Nurhayati', '2450231046', 'Database Administrator (DBA)');
fs.writeFileSync(path.join(outputDir, 'dataset_1000_anita.csv'), csvAnita, 'utf8');

// 3. Set dataset aktif default ke Naysilla (1000 data khusus)
fs.writeFileSync(path.join(outputDir, '1000_mahasiswa_stress_test.csv'), csvNaysilla, 'utf8');
fs.writeFileSync(path.join(outputDir, 'dataset_1000_mahasiswa.csv'), csvNaysilla, 'utf8');

console.log(' Berhasil men-generate 1.000 data khusus:');
console.log('   - data/dataset_1000_naysilla.csv  (1.000 baris khusus Naysilla Sifa Aprilianissa)');
console.log('   - data/dataset_1000_anita.csv     (1.000 baris khusus Anita Nurhayati)');
console.log('   - data/1000_mahasiswa_stress_test.csv (Default aktif khusus 1.000 data)');
