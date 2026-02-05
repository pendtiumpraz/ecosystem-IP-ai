// Complete dropdown options for Studio

// ========== CHARACTER OPTIONS ==========

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-Binary" },
];

export const AGE_RANGE_OPTIONS = [
  { value: "child", label: "Child (5-12)" },
  { value: "teen", label: "Teen (13-17)" },
  { value: "young-adult", label: "Young Adult (18-25)" },
  { value: "adult", label: "Adult (26-40)" },
  { value: "middle-aged", label: "Middle Aged (41-55)" },
  { value: "senior", label: "Senior (56+)" },
];

export const ETHNICITY_OPTIONS = [
  { value: "asian-east", label: "East Asian" },
  { value: "asian-southeast", label: "Southeast Asian" },
  { value: "asian-south", label: "South Asian" },
  { value: "middle-eastern", label: "Middle Eastern" },
  { value: "african", label: "African" },
  { value: "caucasian", label: "Caucasian" },
  { value: "latino", label: "Latino/Hispanic" },
  { value: "mixed", label: "Mixed" },
  { value: "fantasy", label: "Fantasy Race" },
];

export const SKIN_TONE_OPTIONS = [
  { value: "very-fair", label: "Very Fair" },
  { value: "fair", label: "Fair" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "tan", label: "Tan" },
  { value: "olive", label: "Olive" },
  { value: "brown", label: "Brown" },
  { value: "dark-brown", label: "Dark Brown" },
  { value: "dark", label: "Dark" },
];

export const FACE_SHAPE_OPTIONS = [
  { value: "oval", label: "Oval" },
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "heart", label: "Heart" },
  { value: "oblong", label: "Oblong" },
  { value: "diamond", label: "Diamond" },
  { value: "triangle", label: "Triangle" },
];

export const EYE_SHAPE_OPTIONS = [
  { value: "almond", label: "Almond" },
  { value: "round", label: "Round" },
  { value: "monolid", label: "Monolid" },
  { value: "hooded", label: "Hooded" },
  { value: "upturned", label: "Upturned" },
  { value: "downturned", label: "Downturned" },
  { value: "wide-set", label: "Wide Set" },
  { value: "close-set", label: "Close Set" },
];

export const EYE_COLOR_OPTIONS = [
  { value: "brown", label: "Brown" },
  { value: "dark-brown", label: "Dark Brown" },
  { value: "hazel", label: "Hazel" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "gray", label: "Gray" },
  { value: "amber", label: "Amber" },
  { value: "black", label: "Black" },
  { value: "heterochromia", label: "Heterochromia (Different Colors)" },
];

export const NOSE_SHAPE_OPTIONS = [
  { value: "straight", label: "Straight" },
  { value: "button", label: "Button" },
  { value: "roman", label: "Roman/Aquiline" },
  { value: "wide", label: "Wide" },
  { value: "narrow", label: "Narrow" },
  { value: "upturned", label: "Upturned" },
  { value: "flat", label: "Flat" },
];

export const LIPS_SHAPE_OPTIONS = [
  { value: "full", label: "Full" },
  { value: "thin", label: "Thin" },
  { value: "heart", label: "Heart-Shaped" },
  { value: "wide", label: "Wide" },
  { value: "bow", label: "Bow-Shaped" },
  { value: "round", label: "Round" },
];

export const HAIR_STYLE_OPTIONS = [
  { value: "straight-short", label: "Straight Short" },
  { value: "straight-medium", label: "Straight Medium" },
  { value: "straight-long", label: "Straight Long" },
  { value: "wavy-short", label: "Wavy Short" },
  { value: "wavy-medium", label: "Wavy Medium" },
  { value: "wavy-long", label: "Wavy Long" },
  { value: "curly-short", label: "Curly Short" },
  { value: "curly-medium", label: "Curly Medium" },
  { value: "curly-long", label: "Curly Long" },
  { value: "afro", label: "Afro" },
  { value: "braids", label: "Braids" },
  { value: "dreadlocks", label: "Dreadlocks" },
  { value: "bun", label: "Bun" },
  { value: "ponytail", label: "Ponytail" },
  { value: "pixie", label: "Pixie Cut" },
  { value: "bob", label: "Bob" },
  { value: "buzzcut", label: "Buzz Cut" },
  { value: "bald", label: "Bald" },
  { value: "mohawk", label: "Mohawk" },
  { value: "undercut", label: "Undercut" },
];

export const HAIR_COLOR_OPTIONS = [
  { value: "black", label: "Black" },
  { value: "dark-brown", label: "Dark Brown" },
  { value: "brown", label: "Brown" },
  { value: "light-brown", label: "Light Brown" },
  { value: "auburn", label: "Auburn" },
  { value: "red", label: "Red" },
  { value: "ginger", label: "Ginger" },
  { value: "blonde", label: "Blonde" },
  { value: "platinum", label: "Platinum Blonde" },
  { value: "gray", label: "Gray" },
  { value: "white", label: "White" },
  { value: "blue", label: "Blue (Dyed)" },
  { value: "purple", label: "Purple (Dyed)" },
  { value: "pink", label: "Pink (Dyed)" },
  { value: "green", label: "Green (Dyed)" },
  { value: "ombre", label: "Ombre" },
  { value: "highlights", label: "Highlights" },
];

export const HIJAB_OPTIONS = [
  { value: "none", label: "No Hijab" },
  { value: "simple", label: "Simple Hijab" },
  { value: "pashmina", label: "Pashmina Style" },
  { value: "turban", label: "Turban Style" },
  { value: "khimar", label: "Khimar" },
  { value: "niqab", label: "Niqab" },
  { value: "sport", label: "Sport Hijab" },
];

export const BODY_TYPE_OPTIONS = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "muscular", label: "Muscular" },
  { value: "curvy", label: "Curvy" },
  { value: "plus-size", label: "Plus Size" },
  { value: "petite", label: "Petite" },
  { value: "tall", label: "Tall" },
];

export const HEIGHT_OPTIONS = [
  { value: "very-short", label: "Very Short (< 150cm)" },
  { value: "short", label: "Short (150-160cm)" },
  { value: "average", label: "Average (160-175cm)" },
  { value: "tall", label: "Tall (175-185cm)" },
  { value: "very-tall", label: "Very Tall (> 185cm)" },
];

export const CLOTHING_STYLE_OPTIONS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "business", label: "Business" },
  { value: "streetwear", label: "Streetwear" },
  { value: "traditional", label: "Traditional" },
  { value: "sporty", label: "Sporty" },
  { value: "bohemian", label: "Bohemian" },
  { value: "gothic", label: "Gothic" },
  { value: "punk", label: "Punk" },
  { value: "military", label: "Military" },
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "historical", label: "Historical" },
  { value: "uniform", label: "Uniform" },
];

export const ACCESSORIES_OPTIONS = [
  { value: "glasses", label: "Glasses" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "earrings", label: "Earrings" },
  { value: "necklace", label: "Necklace" },
  { value: "bracelet", label: "Bracelet" },
  { value: "watch", label: "Watch" },
  { value: "ring", label: "Ring" },
  { value: "hat", label: "Hat" },
  { value: "scarf", label: "Scarf" },
  { value: "tattoo", label: "Tattoo" },
  { value: "piercing", label: "Piercing" },
  { value: "bag", label: "Bag" },
  { value: "headphones", label: "Headphones" },
];

export const PROPS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sword", label: "Sword" },
  { value: "gun", label: "Gun" },
  { value: "book", label: "Book" },
  { value: "phone", label: "Phone" },
  { value: "laptop", label: "Laptop" },
  { value: "camera", label: "Camera" },
  { value: "musical-instrument", label: "Musical Instrument" },
  { value: "sports-equipment", label: "Sports Equipment" },
  { value: "magic-staff", label: "Magic Staff/Wand" },
  { value: "shield", label: "Shield" },
  { value: "bow", label: "Bow & Arrow" },
  { value: "briefcase", label: "Briefcase" },
  { value: "backpack", label: "Backpack" },
  { value: "umbrella", label: "Umbrella" },
  { value: "flowers", label: "Flowers" },
  { value: "pet", label: "Pet" },
];

export const CHARACTER_ROLE_OPTIONS = [
  { value: "protagonist", label: "Protagonist (Main Hero)" },
  { value: "antagonist", label: "Antagonist (Main Villain)" },
  { value: "deuteragonist", label: "Deuteragonist (Secondary Lead)" },
  { value: "mentor", label: "Mentor" },
  { value: "love-interest", label: "Love Interest" },
  { value: "sidekick", label: "Sidekick" },
  { value: "rival", label: "Rival" },
  { value: "comic-relief", label: "Comic Relief" },
  { value: "support", label: "Supporting Character" },
  { value: "background", label: "Background Character" },
];

export const PERSONALITY_TRAITS_OPTIONS = [
  { value: "brave", label: "Brave" },
  { value: "intelligent", label: "Intelligent" },
  { value: "kind", label: "Kind" },
  { value: "mysterious", label: "Mysterious" },
  { value: "funny", label: "Funny" },
  { value: "serious", label: "Serious" },
  { value: "shy", label: "Shy" },
  { value: "confident", label: "Confident" },
  { value: "rebellious", label: "Rebellious" },
  { value: "loyal", label: "Loyal" },
  { value: "cunning", label: "Cunning" },
  { value: "naive", label: "Naive" },
  { value: "wise", label: "Wise" },
  { value: "hot-headed", label: "Hot-Headed" },
  { value: "calm", label: "Calm" },
  { value: "ambitious", label: "Ambitious" },
  { value: "lazy", label: "Lazy" },
  { value: "perfectionist", label: "Perfectionist" },
];

// ========== 12 JUNGIAN ARCHETYPES ==========
export const ARCHETYPE_OPTIONS = [
  { value: "the-innocent", label: "The Innocent", desc: "Murni, polos, mencari kebahagiaan" },
  { value: "the-orphan", label: "The Orphan", desc: "Realistis, mencari tempat/komunitas" },
  { value: "the-hero", label: "The Hero", desc: "Berani, kuat, ingin membuktikan diri" },
  { value: "the-caregiver", label: "The Caregiver", desc: "Pengasih, melindungi orang lain" },
  { value: "the-explorer", label: "The Explorer", desc: "Petualang, bebas, mencari pengalaman" },
  { value: "the-rebel", label: "The Rebel", desc: "Pemberontak, mendobrak aturan" },
  { value: "the-lover", label: "The Lover", desc: "Penuh cinta, mencari keintiman" },
  { value: "the-creator", label: "The Creator", desc: "Kreatif, membangun sesuatu baru" },
  { value: "the-jester", label: "The Jester", desc: "Lucu, mencari kesenangan" },
  { value: "the-sage", label: "The Sage", desc: "Bijak, mencari kebenaran" },
  { value: "the-magician", label: "The Magician", desc: "Visioner, mengubah realitas" },
  { value: "the-ruler", label: "The Ruler", desc: "Pemimpin, mencari kendali" },
];

// ========== EMOTIONAL EXPRESSION OPTIONS ==========
export const LOGOS_OPTIONS = [
  { value: "analytical", label: "Analytical", desc: "Menggunakan data & logika" },
  { value: "rational", label: "Rational", desc: "Berpikir berdasarkan alasan" },
  { value: "intuitive", label: "Intuitive", desc: "Mengikuti firasat & intuisi" },
  { value: "skeptical", label: "Skeptical", desc: "Mempertanyakan segalanya" },
  { value: "pragmatic", label: "Pragmatic", desc: "Fokus pada solusi praktis" },
];

export const ETHOS_OPTIONS = [
  { value: "authoritative", label: "Authoritative", desc: "Berbicara dengan wewenang ahli" },
  { value: "trustworthy", label: "Trustworthy", desc: "Dapat dipercaya & jujur" },
  { value: "humble", label: "Humble", desc: "Rendah hati & membumi" },
  { value: "charismatic", label: "Charismatic", desc: "Memiliki daya tarik alami" },
  { value: "experienced", label: "Experienced", desc: "Bijak dari pengalaman hidup" },
];

export const PATHOS_OPTIONS = [
  { value: "empathetic", label: "Empathetic", desc: "Merasakan emosi orang lain" },
  { value: "passionate", label: "Passionate", desc: "Memiliki emosi yang intens" },
  { value: "stoic", label: "Stoic", desc: "Mengontrol emosi dengan baik" },
  { value: "expressive", label: "Expressive", desc: "Menunjukkan emosi secara terbuka" },
  { value: "reserved", label: "Reserved", desc: "Menyimpan emosi untuk diri sendiri" },
];

export const EXPRESSION_TONE_OPTIONS = [
  { value: "warm", label: "Warm", desc: "Ramah & mudah didekati" },
  { value: "cold", label: "Cold", desc: "Menjaga jarak & formal" },
  { value: "playful", label: "Playful", desc: "Ceria & ringan" },
  { value: "serious", label: "Serious", desc: "Serius & tegas" },
  { value: "sarcastic", label: "Sarcastic", desc: "Humor ironis/sindiran" },
  { value: "neutral", label: "Neutral", desc: "Nada seimbang & netral" },
];

export const EXPRESSION_STYLE_OPTIONS = [
  { value: "direct", label: "Direct", desc: "Berbicara langsung to the point" },
  { value: "indirect", label: "Indirect", desc: "Menyampaikan secara halus" },
  { value: "verbose", label: "Verbose", desc: "Penjelasan detail panjang" },
  { value: "concise", label: "Concise", desc: "Singkat & padat" },
  { value: "poetic", label: "Poetic", desc: "Puitis & artistik" },
];

export const EXPRESSION_MODE_OPTIONS = [
  { value: "assertive", label: "Assertive", desc: "Percaya diri & tegas" },
  { value: "passive", label: "Passive", desc: "Menghindari konfrontasi" },
  { value: "aggressive", label: "Aggressive", desc: "Memaksa & menekan" },
  { value: "passive-aggressive", label: "Passive-Aggressive", desc: "Permusuhan tersembunyi" },
  { value: "diplomatic", label: "Diplomatic", desc: "Bijak & menjembatani" },
];

// ========== FAMILY OPTIONS ==========
export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single", desc: "Belum punya pasangan" },
  { value: "dating", label: "Dating", desc: "Sedang menjalin hubungan" },
  { value: "engaged", label: "Engaged", desc: "Bertunangan" },
  { value: "married", label: "Married", desc: "Sudah menikah" },
  { value: "divorced", label: "Divorced", desc: "Pernah menikah, cerai" },
  { value: "widowed", label: "Widowed", desc: "Pasangan meninggal" },
  { value: "separated", label: "Separated", desc: "Pisah ranjang" },
  { value: "complicated", label: "Complicated", desc: "Status tidak jelas" },
];

export const CHILDREN_STATUS_OPTIONS = [
  { value: "none", label: "None", desc: "Tidak punya anak" },
  { value: "one", label: "1 Child", desc: "Punya satu anak" },
  { value: "two", label: "2 Children", desc: "Punya dua anak" },
  { value: "three-plus", label: "3+ Children", desc: "Keluarga besar" },
  { value: "expecting", label: "Expecting", desc: "Sedang mengandung" },
  { value: "adopted", label: "Adopted", desc: "Anak adopsi" },
];

export const PARENT_STATUS_OPTIONS = [
  { value: "both-alive", label: "Both Alive", desc: "Kedua orang tua masih hidup" },
  { value: "mother-only", label: "Mother Only", desc: "Ayah sudah meninggal" },
  { value: "father-only", label: "Father Only", desc: "Ibu sudah meninggal" },
  { value: "orphan", label: "Orphan", desc: "Yatim piatu" },
  { value: "estranged", label: "Estranged", desc: "Tidak berhubungan dengan orang tua" },
  { value: "unknown", label: "Unknown", desc: "Orang tua tidak diketahui" },
];

// ========== SOCIOCULTURAL OPTIONS ==========
export const AFFILIATION_OPTIONS = [
  { value: "independent", label: "Independent", desc: "Bebas, tidak terikat organisasi" },
  { value: "organization", label: "Organization", desc: "Bagian dari organisasi" },
  { value: "corporation", label: "Corporation", desc: "Terkait perusahaan besar" },
  { value: "government", label: "Government", desc: "Terkait pemerintahan" },
  { value: "underground", label: "Underground", desc: "Organisasi rahasia/bawah tanah" },
  { value: "religious", label: "Religious", desc: "Lembaga keagamaan" },
  { value: "military", label: "Military", desc: "Militer/angkatan bersenjata" },
  { value: "academic", label: "Academic", desc: "Institusi pendidikan" },
];

export const GROUP_RELATIONSHIP_OPTIONS = [
  { value: "leader", label: "Leader", desc: "Pemimpin/ketua kelompok" },
  { value: "member", label: "Member", desc: "Anggota biasa" },
  { value: "outsider", label: "Outsider", desc: "Orang luar, bukan bagian" },
  { value: "rebel", label: "Rebel", desc: "Pemberontak/pembelot" },
  { value: "founder", label: "Founder", desc: "Pendiri organisasi" },
  { value: "enforcer", label: "Enforcer", desc: "Penegak aturan" },
  { value: "advisor", label: "Advisor", desc: "Penasihat" },
];

export const ECONOMIC_CLASS_OPTIONS = [
  { value: "poverty", label: "Poverty", desc: "Miskin/kurang mampu" },
  { value: "lower-class", label: "Lower Class", desc: "Kelas bawah" },
  { value: "working-class", label: "Working Class", desc: "Kelas pekerja" },
  { value: "middle-class", label: "Middle Class", desc: "Kelas menengah" },
  { value: "upper-middle", label: "Upper Middle", desc: "Menengah ke atas" },
  { value: "wealthy", label: "Wealthy", desc: "Kaya/berada" },
  { value: "elite", label: "Elite", desc: "Kalangan elite/super kaya" },
];

// ========== CORE BELIEFS OPTIONS ==========
export const FAITH_LEVEL_OPTIONS = [
  { value: "devout", label: "Devout", desc: "Sangat taat beragama" },
  { value: "practicing", label: "Practicing", desc: "Menjalankan ibadah rutin" },
  { value: "casual", label: "Casual", desc: "Beribadah kadang-kadang" },
  { value: "spiritual", label: "Spiritual", desc: "Spiritual tapi tidak religius" },
  { value: "agnostic", label: "Agnostic", desc: "Ragu akan keberadaan Tuhan" },
  { value: "atheist", label: "Atheist", desc: "Tidak percaya Tuhan" },
  { value: "questioning", label: "Questioning", desc: "Masih mencari jati diri" },
];

export const RELIGION_OPTIONS = [
  { value: "islam", label: "Islam", desc: "Agama Islam" },
  { value: "christianity", label: "Christianity", desc: "Kristen Protestan" },
  { value: "catholicism", label: "Catholicism", desc: "Katolik Roma" },
  { value: "hinduism", label: "Hinduism", desc: "Agama Hindu" },
  { value: "buddhism", label: "Buddhism", desc: "Agama Buddha" },
  { value: "judaism", label: "Judaism", desc: "Agama Yahudi" },
  { value: "traditional", label: "Traditional", desc: "Kepercayaan adat/leluhur" },
  { value: "spiritual", label: "Spiritual", desc: "Spiritual tanpa agama" },
  { value: "none", label: "None", desc: "Tidak beragama" },
  { value: "fictional", label: "Fictional", desc: "Agama fiksi dalam cerita" },
];

// ========== TRUSTWORTHY OPTIONS ==========
export const WILLINGNESS_OPTIONS = [
  { value: "eager", label: "Eager", desc: "Selalu siap membantu" },
  { value: "willing", label: "Willing", desc: "Terbuka untuk diminta tolong" },
  { value: "conditional", label: "Conditional", desc: "Tergantung situasi" },
  { value: "reluctant", label: "Reluctant", desc: "Perlu dibujuk dulu" },
  { value: "unwilling", label: "Unwilling", desc: "Menolak kerja sama" },
];

export const VULNERABILITY_OPTIONS = [
  { value: "open", label: "Open", desc: "Berbagi dengan bebas" },
  { value: "selective", label: "Selective", desc: "Hati-hati pilih siapa" },
  { value: "guarded", label: "Guarded", desc: "Jarang terbuka" },
  { value: "closed", label: "Closed", desc: "Tak pernah tunjukkan kelemahan" },
  { value: "defensive", label: "Defensive", desc: "Melindungi diri mati-matian" },
];

export const INTEGRITY_OPTIONS = [
  { value: "unwavering", label: "Unwavering", desc: "Tak pernah kompromi prinsip" },
  { value: "strong", label: "Strong", desc: "Jarang melanggar aturan" },
  { value: "flexible", label: "Flexible", desc: "Menyesuaikan situasi" },
  { value: "questionable", label: "Questionable", desc: "Abu-abu secara moral" },
  { value: "corrupt", label: "Corrupt", desc: "Korup, mementingkan diri" },
];

// ========== EDUCATIONAL OPTIONS ==========
export const EDUCATION_LEVEL_OPTIONS = [
  { value: "none", label: "No Formal", desc: "Tanpa pendidikan formal" },
  { value: "elementary", label: "Elementary", desc: "Lulus SD" },
  { value: "middle-school", label: "Middle School", desc: "Lulus SMP" },
  { value: "high-school", label: "High School", desc: "Lulus SMA/SMK" },
  { value: "vocational", label: "Vocational", desc: "Sekolah kejuruan" },
  { value: "associate", label: "Associate", desc: "Diploma (D1-D3)" },
  { value: "bachelor", label: "Bachelor", desc: "Sarjana (S1)" },
  { value: "master", label: "Master", desc: "Magister (S2)" },
  { value: "doctorate", label: "Doctorate", desc: "Doktor (S3)" },
  { value: "self-taught", label: "Self-Taught", desc: "Otodidak" },
];

// ========== SOCIOPOLITICS OPTIONS ==========
export const POLITICAL_STANCE_OPTIONS = [
  { value: "liberal", label: "Liberal", desc: "Progresif, terbuka perubahan" },
  { value: "conservative", label: "Conservative", desc: "Tradisional, mempertahankan nilai" },
  { value: "moderate", label: "Moderate", desc: "Tengah-tengah/netral" },
  { value: "libertarian", label: "Libertarian", desc: "Kebebasan individu maksimal" },
  { value: "socialist", label: "Socialist", desc: "Pro keadilan sosial" },
  { value: "nationalist", label: "Nationalist", desc: "Mengutamakan bangsa sendiri" },
  { value: "apolitical", label: "Apolitical", desc: "Tidak peduli politik" },
  { value: "radical", label: "Radical", desc: "Perubahan ekstrem" },
];

export const NATIONALISM_LEVEL_OPTIONS = [
  { value: "patriotic", label: "Patriotic", desc: "Cinta tanah air" },
  { value: "nationalist", label: "Nationalist", desc: "Bangsa sendiri yang utama" },
  { value: "neutral", label: "Neutral", desc: "Netral soal kebangsaan" },
  { value: "globalist", label: "Globalist", desc: "Warga dunia" },
  { value: "anti-government", label: "Anti-Government", desc: "Menentang pemerintah" },
];

export const CITIZENSHIP_OPTIONS = [
  { value: "citizen", label: "Citizen", desc: "Warga negara penuh" },
  { value: "permanent-resident", label: "Permanent Resident", desc: "Penduduk tetap" },
  { value: "immigrant", label: "Immigrant", desc: "Imigran/pendatang" },
  { value: "refugee", label: "Refugee", desc: "Pengungsi" },
  { value: "stateless", label: "Stateless", desc: "Tanpa kewarganegaraan" },
  { value: "dual-citizen", label: "Dual Citizen", desc: "Dwi kewarganegaraan" },
  { value: "illegal", label: "Undocumented", desc: "Tidak berdokumen resmi" },
];

// ========== GENDER-SPECIFIC HAIR STYLES ==========
// Includes original values for backward compatibility
export const MALE_HAIR_STYLE_OPTIONS = [
  // Original compatible values
  { value: "buzzcut", label: "Buzz Cut" },
  { value: "bald", label: "Bald" },
  { value: "mohawk", label: "Mohawk" },
  { value: "undercut", label: "Undercut" },
  { value: "curly-short", label: "Curly Short" },
  { value: "curly-medium", label: "Curly Medium" },
  { value: "afro", label: "Afro" },
  { value: "dreadlocks", label: "Dreadlocks" },
  // New male-specific styles
  { value: "crew-cut", label: "Crew Cut" },
  { value: "fade", label: "Fade" },
  { value: "textured-crop", label: "Textured Crop" },
  { value: "slick-back", label: "Slick Back" },
  { value: "pompadour", label: "Pompadour" },
  { value: "quiff", label: "Quiff" },
  { value: "man-bun", label: "Man Bun" },
  { value: "ponytail", label: "Ponytail" },
  { value: "straight-short", label: "Straight Short" },
  { value: "straight-medium", label: "Straight Medium" },
  { value: "wavy-short", label: "Wavy Short" },
  { value: "wavy-medium", label: "Wavy Medium" },
  { value: "receding", label: "Receding Hairline" },
  { value: "shaved-sides", label: "Shaved Sides" },
];

export const FEMALE_HAIR_STYLE_OPTIONS = [
  // Original compatible values
  { value: "straight-short", label: "Straight Short" },
  { value: "straight-medium", label: "Straight Medium" },
  { value: "straight-long", label: "Straight Long" },
  { value: "wavy-short", label: "Wavy Short" },
  { value: "wavy-medium", label: "Wavy Medium" },
  { value: "wavy-long", label: "Wavy Long" },
  { value: "curly-short", label: "Curly Short" },
  { value: "curly-medium", label: "Curly Medium" },
  { value: "curly-long", label: "Curly Long" },
  { value: "pixie", label: "Pixie Cut" },
  { value: "bob", label: "Bob" },
  { value: "bun", label: "Bun" },
  { value: "ponytail", label: "Ponytail" },
  { value: "braids", label: "Braids" },
  { value: "afro", label: "Afro" },
  { value: "dreadlocks", label: "Dreadlocks" },
  // New female-specific styles
  { value: "lob", label: "Lob (Long Bob)" },
  { value: "layers", label: "Layered" },
  { value: "bangs", label: "With Bangs" },
  { value: "twin-tails", label: "Twin Tails" },
  { value: "updo", label: "Updo" },
  { value: "side-swept", label: "Side Swept" },
];



// ========== STORY OPTIONS ==========


export const GENRE_OPTIONS = [
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "animation", label: "Animation" },
  { value: "comedy", label: "Comedy" },
  { value: "crime", label: "Crime" },
  { value: "documentary", label: "Documentary" },
  { value: "drama", label: "Drama" },
  { value: "family", label: "Family" },
  { value: "fantasy", label: "Fantasy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "thriller", label: "Thriller" },
  { value: "war", label: "War" },
  { value: "western", label: "Western" },
  { value: "musical", label: "Musical" },
  { value: "sports", label: "Sports" },
  { value: "slice-of-life", label: "Slice of Life" },
  { value: "supernatural", label: "Supernatural" },
];

export const FORMAT_OPTIONS = [
  { value: "feature-film", label: "Feature Film (90-150 min)" },
  { value: "short-film", label: "Short Film (< 40 min)" },
  { value: "series-episodic", label: "Series - Episodic (standalone episodes)" },
  { value: "series-serial", label: "Series - Serial (continuous story)" },
  { value: "limited-series", label: "Limited Series (4-10 episodes)" },
  { value: "web-series", label: "Web Series (short episodes)" },
  { value: "anime", label: "Anime Series" },
  { value: "documentary", label: "Documentary" },
];

export const TARGET_AUDIENCE_OPTIONS = [
  { value: "children", label: "Children (5-12)" },
  { value: "teens", label: "Teens (13-17)" },
  { value: "young-adults", label: "Young Adults (18-25)" },
  { value: "adults", label: "Adults (26-45)" },
  { value: "mature", label: "Mature (46+)" },
  { value: "family", label: "Family (All Ages)" },
];

export const TONE_OPTIONS = [
  { value: "light-hearted", label: "Light-Hearted" },
  { value: "dramatic", label: "Dramatic" },
  { value: "dark", label: "Dark" },
  { value: "comedic", label: "Comedic" },
  { value: "suspenseful", label: "Suspenseful" },
  { value: "romantic", label: "Romantic" },
  { value: "action-packed", label: "Action-Packed" },
  { value: "inspirational", label: "Inspirational" },
  { value: "melancholic", label: "Melancholic" },
  { value: "satirical", label: "Satirical" },
];

export const STORY_STRUCTURE_OPTIONS = [
  { value: "three-act", label: "Three-Act Structure" },
  { value: "hero-journey", label: "Hero's Journey (12 Steps)" },
  { value: "save-cat", label: "Save the Cat (15 Beats)" },
  { value: "dan-harmon", label: "Dan Harmon's Story Circle (8 Steps)" },
  { value: "five-act", label: "Five-Act Structure" },
  { value: "seven-point", label: "Seven-Point Story Structure" },
  { value: "freytag", label: "Freytag's Pyramid" },
  { value: "kishotenketsu", label: "Kishotenketsu (4-Act)" },
];

export const CONFLICT_TYPE_OPTIONS = [
  { value: "man-vs-man", label: "Man vs Man" },
  { value: "man-vs-nature", label: "Man vs Nature" },
  { value: "man-vs-self", label: "Man vs Self" },
  { value: "man-vs-society", label: "Man vs Society" },
  { value: "man-vs-technology", label: "Man vs Technology" },
  { value: "man-vs-supernatural", label: "Man vs Supernatural" },
  { value: "man-vs-fate", label: "Man vs Fate/God" },
];

export const THEME_OPTIONS = [
  { value: "love", label: "Love & Relationships" },
  { value: "family", label: "Family" },
  { value: "friendship", label: "Friendship" },
  { value: "revenge", label: "Revenge" },
  { value: "redemption", label: "Redemption" },
  { value: "justice", label: "Justice" },
  { value: "power", label: "Power & Corruption" },
  { value: "identity", label: "Identity & Self-Discovery" },
  { value: "survival", label: "Survival" },
  { value: "sacrifice", label: "Sacrifice" },
  { value: "hope", label: "Hope" },
  { value: "loss", label: "Loss & Grief" },
  { value: "coming-of-age", label: "Coming of Age" },
  { value: "good-vs-evil", label: "Good vs Evil" },
];

// ========== IP PROJECT OPTIONS ==========

// Type of Medium (Format)
export const MEDIUM_TYPE_OPTIONS = [
  { value: "feature-film", label: "Feature Film", defaultDuration: 120, defaultScenes: 60 },
  { value: "short-film", label: "Short Film", defaultDuration: 20, defaultScenes: 10 },
  { value: "tv-series", label: "TV Series (Episode)", defaultDuration: 45, defaultScenes: 25 },
  { value: "limited-series", label: "Limited Series (Episode)", defaultDuration: 60, defaultScenes: 30 },
  { value: "web-series", label: "Web Series (Episode)", defaultDuration: 15, defaultScenes: 8 },
  { value: "anime-series", label: "Anime Series (Episode)", defaultDuration: 24, defaultScenes: 12 },
  { value: "documentary", label: "Documentary", defaultDuration: 90, defaultScenes: 45 },
  { value: "commercial", label: "Commercial/Ad", defaultDuration: 1, defaultScenes: 3 },
  { value: "music-video", label: "Music Video", defaultDuration: 4, defaultScenes: 8 },
];

// Duration presets in minutes (1 scene per 1 minute)
export const DURATION_OPTIONS = [
  { value: "1", label: "1 minute", scenes: 1 },
  { value: "3", label: "3 minutes", scenes: 3 },
  { value: "5", label: "5 minutes", scenes: 5 },
  { value: "10", label: "10 minutes", scenes: 10 },
  { value: "15", label: "15 minutes", scenes: 15 },
  { value: "20", label: "20 minutes", scenes: 20 },
  { value: "24", label: "24 minutes (Anime Standard)", scenes: 24 },
  { value: "30", label: "30 minutes", scenes: 30 },
  { value: "45", label: "45 minutes", scenes: 45 },
  { value: "60", label: "60 minutes", scenes: 60 },
  { value: "90", label: "90 minutes", scenes: 90 },
  { value: "105", label: "105 minutes", scenes: 105 },
  { value: "120", label: "120 minutes (2 hours)", scenes: 120 },
  { value: "150", label: "150 minutes (2.5 hours)", scenes: 150 },
  { value: "custom", label: "Custom Duration", scenes: 0 },
];

// Sub-Genre options (grouped by main genre)
export const SUB_GENRE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  action: [
    { value: "martial-arts", label: "Martial Arts" },
    { value: "military", label: "Military Action" },
    { value: "heist", label: "Heist" },
    { value: "spy", label: "Spy/Espionage" },
    { value: "superhero", label: "Superhero" },
  ],
  adventure: [
    { value: "treasure-hunt", label: "Treasure Hunt" },
    { value: "survival", label: "Survival" },
    { value: "exploration", label: "Exploration" },
    { value: "quest", label: "Quest" },
  ],
  comedy: [
    { value: "romantic-comedy", label: "Romantic Comedy" },
    { value: "dark-comedy", label: "Dark Comedy" },
    { value: "slapstick", label: "Slapstick" },
    { value: "parody", label: "Parody/Satire" },
    { value: "buddy-comedy", label: "Buddy Comedy" },
  ],
  drama: [
    { value: "family-drama", label: "Family Drama" },
    { value: "legal-drama", label: "Legal Drama" },
    { value: "medical-drama", label: "Medical Drama" },
    { value: "political-drama", label: "Political Drama" },
    { value: "period-drama", label: "Period Drama" },
    { value: "sports-drama", label: "Sports Drama" },
  ],
  fantasy: [
    { value: "high-fantasy", label: "High Fantasy" },
    { value: "urban-fantasy", label: "Urban Fantasy" },
    { value: "dark-fantasy", label: "Dark Fantasy" },
    { value: "fairy-tale", label: "Fairy Tale" },
    { value: "mythological", label: "Mythological" },
  ],
  horror: [
    { value: "supernatural-horror", label: "Supernatural Horror" },
    { value: "slasher", label: "Slasher" },
    { value: "psychological-horror", label: "Psychological Horror" },
    { value: "zombie", label: "Zombie" },
    { value: "folk-horror", label: "Folk Horror" },
    { value: "body-horror", label: "Body Horror" },
  ],
  mystery: [
    { value: "detective", label: "Detective" },
    { value: "whodunit", label: "Whodunit" },
    { value: "noir", label: "Noir" },
    { value: "cozy-mystery", label: "Cozy Mystery" },
  ],
  romance: [
    { value: "contemporary-romance", label: "Contemporary Romance" },
    { value: "historical-romance", label: "Historical Romance" },
    { value: "paranormal-romance", label: "Paranormal Romance" },
    { value: "romantic-drama", label: "Romantic Drama" },
  ],
  "sci-fi": [
    { value: "space-opera", label: "Space Opera" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "dystopian", label: "Dystopian" },
    { value: "time-travel", label: "Time Travel" },
    { value: "alien-invasion", label: "Alien Invasion" },
    { value: "hard-sci-fi", label: "Hard Sci-Fi" },
  ],
  thriller: [
    { value: "psychological-thriller", label: "Psychological Thriller" },
    { value: "crime-thriller", label: "Crime Thriller" },
    { value: "political-thriller", label: "Political Thriller" },
    { value: "techno-thriller", label: "Techno-Thriller" },
    { value: "action-thriller", label: "Action Thriller" },
  ],
};

// Core Conflict Types
export const CORE_CONFLICT_OPTIONS = [
  { value: "person-vs-person", label: "Person vs Person", description: "Conflict between two characters" },
  { value: "person-vs-self", label: "Person vs Self", description: "Internal struggle, moral dilemma" },
  { value: "person-vs-society", label: "Person vs Society", description: "Against social norms, institutions" },
  { value: "person-vs-nature", label: "Person vs Nature", description: "Survival against natural forces" },
  { value: "person-vs-technology", label: "Person vs Technology", description: "Against machines, AI, progress" },
  { value: "person-vs-supernatural", label: "Person vs Supernatural", description: "Against gods, demons, magic" },
  { value: "person-vs-fate", label: "Person vs Fate/Destiny", description: "Against predetermined destiny" },
];

// Story Structure Options (for IP Project level - locked after selection)
// Same options as CreateStoryModal STRUCTURE_TYPES
export const IP_STORY_STRUCTURE_OPTIONS = [
  { value: "hero-journey", label: "Hero's Journey", steps: 12, icon: "🦸", description: "12 langkah perjalanan pahlawan klasik" },
  { value: "save-the-cat", label: "Save the Cat", steps: 15, icon: "🐱", description: "15 beat untuk cerita yang engaging" },
  { value: "dan-harmon", label: "Dan Harmon Story Circle", steps: 8, icon: "⭕", description: "8 langkah storytelling sederhana tapi powerful" },
  { value: "three-act", label: "Three Act Structure", steps: 8, icon: "🎭", description: "8 beat klasik: Setup, Confrontation, Resolution" },
  { value: "freytag", label: "Freytag's Pyramid", steps: 5, icon: "📐", description: "5 fase dramatis klasik untuk tragedy/drama" },
  { value: "custom", label: "Custom Structure", steps: 0, icon: "✨", description: "Buat struktur sendiri sesuai kebutuhan", isCustom: true },
];

// ========== UNIVERSE/WORLD OPTIONS ==========

export const SETTING_ERA_OPTIONS = [
  { value: "prehistoric", label: "Prehistoric" },
  { value: "ancient", label: "Ancient (before 500 AD)" },
  { value: "medieval", label: "Medieval (500-1500)" },
  { value: "renaissance", label: "Renaissance (1400-1600)" },
  { value: "colonial", label: "Colonial Era" },
  { value: "industrial", label: "Industrial Revolution" },
  { value: "victorian", label: "Victorian Era" },
  { value: "early-modern", label: "Early Modern (1900-1950)" },
  { value: "modern", label: "Modern (1950-2000)" },
  { value: "contemporary", label: "Contemporary (2000-Present)" },
  { value: "near-future", label: "Near Future (2030-2100)" },
  { value: "far-future", label: "Far Future (2100+)" },
  { value: "post-apocalyptic", label: "Post-Apocalyptic" },
  { value: "alternate-history", label: "Alternate History" },
];

export const SETTING_LOCATION_OPTIONS = [
  { value: "urban-city", label: "Urban City" },
  { value: "suburban", label: "Suburban" },
  { value: "rural", label: "Rural" },
  { value: "village", label: "Village" },
  { value: "island", label: "Island" },
  { value: "mountain", label: "Mountain" },
  { value: "forest", label: "Forest" },
  { value: "desert", label: "Desert" },
  { value: "ocean", label: "Ocean/Sea" },
  { value: "arctic", label: "Arctic/Polar" },
  { value: "jungle", label: "Jungle" },
  { value: "space-station", label: "Space Station" },
  { value: "spaceship", label: "Spaceship" },
  { value: "alien-planet", label: "Alien Planet" },
  { value: "underground", label: "Underground" },
  { value: "underwater", label: "Underwater" },
  { value: "fantasy-realm", label: "Fantasy Realm" },
];

export const WORLD_TYPE_OPTIONS = [
  { value: "real-world", label: "Real World" },
  { value: "alternate-earth", label: "Alternate Earth" },
  { value: "high-fantasy", label: "High Fantasy" },
  { value: "low-fantasy", label: "Low Fantasy" },
  { value: "urban-fantasy", label: "Urban Fantasy" },
  { value: "sci-fi-hard", label: "Hard Sci-Fi" },
  { value: "sci-fi-soft", label: "Soft Sci-Fi" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "steampunk", label: "Steampunk" },
  { value: "dieselpunk", label: "Dieselpunk" },
  { value: "dystopia", label: "Dystopia" },
  { value: "utopia", label: "Utopia" },
  { value: "supernatural", label: "Supernatural" },
];

export const TECHNOLOGY_LEVEL_OPTIONS = [
  { value: "primitive", label: "Primitive" },
  { value: "medieval", label: "Medieval" },
  { value: "early-industrial", label: "Early Industrial" },
  { value: "modern", label: "Modern" },
  { value: "near-future", label: "Near Future" },
  { value: "advanced", label: "Advanced" },
  { value: "post-singularity", label: "Post-Singularity" },
  { value: "mixed", label: "Mixed/Anachronistic" },
];

export const MAGIC_SYSTEM_OPTIONS = [
  { value: "none", label: "No Magic" },
  { value: "soft", label: "Soft Magic (Undefined Rules)" },
  { value: "hard", label: "Hard Magic (Defined Rules)" },
  { value: "elemental", label: "Elemental Magic" },
  { value: "divine", label: "Divine/Religious Magic" },
  { value: "chi-ki", label: "Chi/Ki/Life Force" },
  { value: "psychic", label: "Psychic Powers" },
  { value: "alchemy", label: "Alchemy" },
  { value: "technology-magic", label: "Technology as Magic" },
];

// ========== MOODBOARD OPTIONS ==========

export const VISUAL_STYLE_OPTIONS = [
  { value: "realistic", label: "Realistic" },
  { value: "semi-realistic", label: "Semi-Realistic" },
  { value: "anime", label: "Anime" },
  { value: "cartoon", label: "Cartoon" },
  { value: "3d-render", label: "3D Render" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "watercolor", label: "Watercolor" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "comic-book", label: "Comic Book" },
  { value: "minimalist", label: "Minimalist" },
  { value: "noir", label: "Noir" },
  { value: "retro", label: "Retro" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "steampunk", label: "Steampunk" },
];

export const COLOR_PALETTE_OPTIONS = [
  { value: "vibrant", label: "Vibrant" },
  { value: "pastel", label: "Pastel" },
  { value: "muted", label: "Muted" },
  { value: "monochrome", label: "Monochrome" },
  { value: "warm", label: "Warm Tones" },
  { value: "cool", label: "Cool Tones" },
  { value: "earth", label: "Earth Tones" },
  { value: "neon", label: "Neon" },
  { value: "dark", label: "Dark" },
  { value: "high-contrast", label: "High Contrast" },
];

export const LIGHTING_OPTIONS = [
  { value: "natural", label: "Natural Light" },
  { value: "studio", label: "Studio Lighting" },
  { value: "dramatic", label: "Dramatic" },
  { value: "soft", label: "Soft" },
  { value: "golden-hour", label: "Golden Hour" },
  { value: "blue-hour", label: "Blue Hour" },
  { value: "neon", label: "Neon Lights" },
  { value: "candlelight", label: "Candlelight" },
  { value: "moonlight", label: "Moonlight" },
  { value: "high-key", label: "High Key" },
  { value: "low-key", label: "Low Key" },
];

export const CAMERA_ANGLE_OPTIONS = [
  { value: "eye-level", label: "Eye Level" },
  { value: "low-angle", label: "Low Angle" },
  { value: "high-angle", label: "High Angle" },
  { value: "birds-eye", label: "Bird's Eye View" },
  { value: "worms-eye", label: "Worm's Eye View" },
  { value: "dutch-angle", label: "Dutch Angle" },
  { value: "over-shoulder", label: "Over the Shoulder" },
  { value: "close-up", label: "Close-Up" },
  { value: "extreme-close-up", label: "Extreme Close-Up" },
  { value: "wide-shot", label: "Wide Shot" },
  { value: "establishing", label: "Establishing Shot" },
];
