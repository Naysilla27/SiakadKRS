import fs from 'fs';
import path from 'path';

const sourceCsvPath = 'C:/Users/Asus/.gemini/antigravity/brain/e24a9df3-7d43-4ae0-bb03-4fad5559c7b7/.user_uploaded/media_1793876105025_ba136fe8.csv';
const outputDir = path.resolve('data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const rawContent = fs.readFileSync(sourceCsvPath, 'utf8');
const lines = rawContent.trim().split('\n');
const header = lines[0].trim();

// Anggota kelompok & perannya
const members = [
  {
    name: 'Anita Nurhayati',
    nim: '2450231046',
    role: 'Database Administrator (DBA)',
    kontributor: 'Anita Nurhayati (2450231046)',
    startIdx: 0,
    endIdx: 250
  },
  {
    name: 'Naysilla Sifa Aprilianissa',
    nim: '2450231059',
    role: 'Backend Developer',
    kontributor: 'Naysilla Sifa Aprilianissa (2450231059)',
    startIdx: 250,
    endIdx: 500
  },
  {
    name: 'Nayla Putri Romdoni',
    nim: '2450231051',
    role: 'Frontend Developer',
    kontributor: 'Nayla Putri Romdoni (2450231051)',
    startIdx: 500,
    endIdx: 750
  },
  {
    name: 'Meila Fitri',
    nim: '2450231054',
    role: 'Quality Assurance (QA / Tester)',
    kontributor: 'Meila Fitri (2450231054)',
    startIdx: 750,
    endIdx: 1000
  }
];

// Fungsi untuk menentukan IPK & Maks SKS secara realistis sesuai distribusi akademik
function generateRealisticIPK(i) {
  // Gunakan pola modulo agar terdistribusi merata across 5 tier beban SKS
  const mod = i % 100;
  let ipk;
  if (mod < 50) {
    // 50% mahasiswa: IPK 3.00 - 4.00 (Maks 24 SKS)
    // Variasi antara 3.00 sampai 3.98
    const base = 3.00;
    const offset = ((i * 7 + 13) % 99) / 100; // 0.00 - 0.98
    ipk = (base + offset * 0.98).toFixed(2);
    if (parseFloat(ipk) > 4.00) ipk = '4.00';
  } else if (mod < 75) {
    // 25% mahasiswa: IPK 2.50 - 2.99 (Maks 21 SKS)
    const base = 2.50;
    const offset = ((i * 11 + 7) % 49) / 100; // 0.00 - 0.48
    ipk = (base + offset).toFixed(2);
  } else if (mod < 90) {
    // 15% mahasiswa: IPK 2.00 - 2.49 (Maks 18 SKS)
    const base = 2.00;
    const offset = ((i * 13 + 5) % 49) / 100; // 0.00 - 0.48
    ipk = (base + offset).toFixed(2);
  } else if (mod < 96) {
    // 6% mahasiswa: IPK 1.50 - 1.99 (Maks 15 SKS)
    const base = 1.50;
    const offset = ((i * 17 + 3) % 49) / 100; // 0.00 - 0.48
    ipk = (base + offset).toFixed(2);
  } else {
    // 4% mahasiswa: IPK 0.00 - 1.49 (Maks 12 SKS)
    const base = 1.10;
    const offset = ((i * 19 + 2) % 38) / 100; // 0.00 - 0.37
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

// Regex / helper parser untuk baris CSV yang memiliki quote
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

const enrichedRows = [];
// Baris data 1..1000
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = parseCsvLine(line);
  // cols: [nim, nama, email, tahun_masuk, status, kode_prodi, id_dosen_pa, no_hp, kontributor, peran_tim]
  const dataIdx = i - 1; // 0..999
  const member = members.find(m => dataIdx >= m.startIdx && dataIdx < m.endIdx);
  const { ipk, maksSks } = generateRealisticIPK(dataIdx);

  const nim = cols[0];
  const nama = cols[1];
  const email = cols[2];
  const tahunMasuk = cols[3];
  const status = cols[4];
  const kodeProdi = cols[5];
  const idDosenPa = cols[6];
  const noHp = cols[7];

  enrichedRows.push({
    nim,
    nama,
    email,
    tahun_masuk: tahunMasuk,
    status,
    kode_prodi: kodeProdi,
    id_dosen_pa: idDosenPa,
    no_hp: noHp,
    ips_lalu: ipk,
    maks_sks: maksSks,
    kontributor: member.kontributor,
    peran_tim: member.role
  });
}

// Generate CSV string
const newHeader = 'nim,nama,email,tahun_masuk,status,kode_prodi,id_dosen_pa,no_hp,ips_lalu,maks_sks,kontributor,peran_tim';
const csvLines = [newHeader];

for (const r of enrichedRows) {
  csvLines.push(`${r.nim},"${r.nama}",${r.email},${r.tahun_masuk},${r.status},${r.kode_prodi},${r.id_dosen_pa},${r.no_hp},${r.ips_lalu},${r.maks_sks},"${r.kontributor}","${r.peran_tim}"`);
}

const outputContent = csvLines.join('\n');
const targetFile1 = path.join(outputDir, '1000_mahasiswa_stress_test.csv');
const targetFile2 = path.join(outputDir, 'dataset_1000_mahasiswa.csv');

fs.writeFileSync(targetFile1, outputContent, 'utf8');
fs.writeFileSync(targetFile2, outputContent, 'utf8');

console.log(` Berhasil membuat ${enrichedRows.length} baris dataset diperkaya di:`);
console.log(`   - ${targetFile1}`);
console.log(`   - ${targetFile2}`);

// Statistik distribusi
const tierCounts = {
  '3.00 - 4.00 (24 SKS)': 0,
  '2.50 - 2.99 (21 SKS)': 0,
  '2.00 - 2.49 (18 SKS)': 0,
  '1.50 - 1.99 (15 SKS)': 0,
  '0.00 - 1.49 (12 SKS)': 0
};

const memberCounts = {};
for (const m of members) {
  memberCounts[m.name] = 0;
}

for (const r of enrichedRows) {
  const ipk = parseFloat(r.ips_lalu);
  if (ipk >= 3.00) tierCounts['3.00 - 4.00 (24 SKS)']++;
  else if (ipk >= 2.50) tierCounts['2.50 - 2.99 (21 SKS)']++;
  else if (ipk >= 2.00) tierCounts['2.00 - 2.49 (18 SKS)']++;
  else if (ipk >= 1.50) tierCounts['1.50 - 1.99 (15 SKS)']++;
  else tierCounts['0.00 - 1.49 (12 SKS)']++;

  for (const m of members) {
    if (r.kontributor.includes(m.name)) {
      memberCounts[m.name]++;
    }
  }
}

console.log('\n Distribusi Beban SKS Berdasarkan IPK:');
console.table(tierCounts);

console.log('\n Pembagian Kontribusi 4 Anggota Kelompok:');
console.table(memberCounts);
