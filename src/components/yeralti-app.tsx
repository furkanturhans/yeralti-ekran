import { useEffect, useState } from "react";
import { Bird, Crown, Shield, Star, Users, Menu, X } from "lucide-react";

type TabId = "envanter" | "silahlar" | "adamlar" | "karakter" | "hapishane" | "ayarlar";

type Task = { id: string; title: string; detail: string; progress: number; goal: number; icon: string };

type Save = {
  money: number;
  ammo: number;
  hp: number;
  y: number;
  power: number;
  sound: boolean;
  notify: boolean;
  owned: string[];
  jailed: boolean;
  tasks: Task[];
};

const HP_MAX = 100;
const KEY = "yeralti-istanbul-v2";
const XP_MAX = 12000;
const XP = 6350;

const RANKS = [
  { name: "KUZGUN", range: "1-5", icon: Bird },
  { name: "ŞAHBAZ", range: "6-10", icon: Bird, active: true },
  { name: "KARTAL", range: "11-15", icon: Shield },
  { name: "KURT", range: "16-20", icon: Shield },
  { name: "ASLAN", range: "21+", icon: Users },
];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "envanter", label: "ENVANTER", icon: "/yeralti/briefcase.png" },
  { id: "silahlar", label: "SİLAHLAR", icon: "/yeralti/pistol.png" },
  { id: "adamlar", label: "ADAMLARIM", icon: "/yeralti/crew.png" },
  { id: "karakter", label: "KARAKTER", icon: "/yeralti/person.png" },
  { id: "hapishane", label: "HAPİSHANE", icon: "/yeralti/jail.png" },
  { id: "ayarlar", label: "AYARLAR", icon: "/yeralti/gear.png" },
];

const defaultSave = (): Save => ({
  money: 2458750,
  ammo: 25000,
  hp: 87,
  y: 120,
  power: 18,
  sound: true,
  notify: true,
  owned: ["saat"],
  jailed: false,
  tasks: [
    {
      id: "aile",
      title: "AİLE TOPLANTISI",
      detail: "Şahin Ailesi toplantısına katıl.",
      progress: 0,
      goal: 1,
      icon: "/yeralti/skull.png",
    },
    {
      id: "borc",
      title: "BORÇ TAHSİLATI",
      detail: "Eminönü'ndeki borcu tahsil et.",
      progress: 1,
      goal: 1,
      icon: "/yeralti/bag.png",
    },
    {
      id: "rakip",
      title: "RAKİP UYARISI",
      detail: "Kara Levent'e gözdağı ver.",
      progress: 0,
      goal: 1,
      icon: "/yeralti/skull.png",
    },
  ],
});

function money(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function zipUrl() {
  if (typeof window === "undefined") return "/Yeralti-guncel.zip";
  const match = window.location.pathname.match(/^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i);
  return `${match ? match[0] : ""}/Yeralti-guncel.zip`;
}

export function YeraltiApp() {
  const [tab, setTab] = useState<TabId>("karakter");
  const [save, setSave] = useState<Save>(defaultSave);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [zipState, setZipState] = useState("Unity dosyasını indir");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSave({ ...defaultSave(), ...JSON.parse(raw) });
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(save));
  }, [save, ready]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 1400);
    return () => window.clearTimeout(id);
  }, [toast]);

  function bump(kind: "money" | "ammo" | "hp" | "y" | "power") {
    setSave((s) => {
      if (kind === "money") return { ...s, money: s.money + 25000 };
      if (kind === "ammo") return { ...s, ammo: s.ammo + 1000 };
      if (kind === "y") return { ...s, y: s.y + 10 };
      if (kind === "power") return { ...s, power: Math.min(100, s.power + 4) };
      return { ...s, hp: Math.min(HP_MAX, s.hp + 5) };
    });
    const note =
      kind === "money"
        ? "+25.000 ₺"
        : kind === "ammo"
          ? "+1.000 mermi"
          : kind === "y"
            ? "+10 YM"
            : kind === "power"
              ? "Güç arttı"
              : "Can yenilendi";
    setToast(note);
  }

  function doTask(id: string) {
    setSave((s) => ({
      ...s,
      money: s.money + 40000,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, progress: Math.min(t.goal, t.progress + 1) } : t)),
    }));
    setToast("Görev ilerledi");
  }

  const segs = 10;
  const filled = Math.round((save.hp / HP_MAX) * segs);

  return (
    <div className="stage">
      <button
        className="download"
        type="button"
        onClick={() => {
          const url = zipUrl();
          setZipState("İndiriliyor…");
          void fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error(String(res.status));
              return res.blob();
            })
            .then((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = objectUrl;
              link.download = "Yeralti-guncel.zip";
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(objectUrl);
              setZipState("İndirme başladı");
            })
            .catch(() => setZipState("İnmedi, tekrar bas"));
        }}
      >
        {zipState}
      </button>
      <div className="phone" style={{ ["--bg" as string]: "url(/yeralti/bg.jpg)" }}>
        <header className="top">
          <div className="brand">
            <h1 className="logo">
              YER<span>A</span>LTI
            </h1>
            <p className="sublogo">İSTANBUL</p>
          </div>
          <button className="menu-btn" aria-label="Menü" onClick={() => setMenu(true)}>
            <Menu />
          </button>
        </header>

        <div className="stats">
          <div className="stat ycur">
            <span className="ym-mark" title="Yeraltı Money">
              YM
            </span>
            <b>{money(save.y)}</b>
            <button className="plus" onClick={() => bump("y")} aria-label="Yeraltı Money ekle">
              +
            </button>
          </div>
          <div className="stat power">
            <span className="power-mark" aria-hidden>
              <i />
            </span>
            <b>{save.power}%</b>
            <button className="plus" onClick={() => bump("power")} aria-label="Güç artır">
              +
            </button>
          </div>
          <div className="stat can">
            <img src="/yeralti/icon_can.png" alt="" />
            <div className="grow">
              <b>
                {save.hp} / {HP_MAX}
              </b>
              <div className="hp-segs" aria-hidden>
                {Array.from({ length: segs }, (_, i) => (
                  <i key={i} className={i < filled ? "on" : ""} />
                ))}
              </div>
            </div>
            <button className="plus" onClick={() => bump("hp")} aria-label="Can ekle">
              +
            </button>
          </div>
          <div className="stat">
            <img src="/yeralti/icon_para.png" alt="" />
            <b>{money(save.money)} ₺</b>
            <button className="plus" onClick={() => bump("money")} aria-label="Para ekle">
              +
            </button>
          </div>
          <div className="stat ammo">
            <img src="/yeralti/icon_mermi.png" alt="" />
            <b>{money(save.ammo)}</b>
            <button className="plus" onClick={() => bump("ammo")} aria-label="Mermi ekle">
              +
            </button>
          </div>
        </div>

        <div className="body">
          {tab === "karakter" ? (
            <Character save={save} onTask={doTask} />
          ) : (
            <Section tab={tab} save={save} setSave={setSave} note={setToast} />
          )}
        </div>

        <nav className="dock" aria-label="Alt menü">
          {TABS.map((item) => (
            <button key={item.id} className={tab === item.id ? "on" : ""} onClick={() => setTab(item.id)}>
              <img src={item.icon} alt="" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="foot">
          <span>YERALTI v1.3.7</span>
          <span>İSTANBUL</span>
        </div>

        {toast ? <div className="toast">{toast}</div> : null}

        {menu ? (
          <div className="veil" onClick={() => setMenu(false)}>
            <aside className="drawer" onClick={(e) => e.stopPropagation()}>
              <button className="menu-btn" aria-label="Kapat" onClick={() => setMenu(false)}>
                <X />
              </button>
              <h2>YERALTI</h2>
              {TABS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMenu(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Character({ save, onTask }: { save: Save; onTask: (id: string) => void }) {
  return (
    <div className="sheet">
      <div>
        <div className="frame portrait-wrap">
          <img className="portrait" src="/yeralti/portrait.jpg" alt="Kaya Demir" />
        </div>
        <div className="identity">
          <p className="kicker">KİMLİK</p>
          <h2 className="name">KAYA DEMİR</h2>
          <p className="meta">Kod Adı: KAYA</p>
          <p className="meta">
            Sadakat: <em>ŞAHİN AİLESİ</em>
          </p>
          <p className="bio">İstanbul'un en karanlık sokaklarında yetişti. Sadakat onun kanunudur.</p>
          <div className="facts">
            <div>
              <strong>YAŞ 41</strong>
              İLKELİ LİDER
            </div>
            <div>
              <strong>DOĞUM YERİ İSTANBUL / KARAGÜMRÜK</strong>
              UZMANLIK ORGANİZASYON / KORUMA
            </div>
          </div>
        </div>
      </div>

      <div>
        <section className="frame rank-card">
          <div className="rank-head">
            RÜTBE <Star size={14} />
          </div>
          <img className="emblem" src="/yeralti/emblem.png" alt="Şahin arması" />
          <h2 className="rank-name">ŞAHİN</h2>
          <p className="level">SEVİYE 7</p>
          <div className="xp" aria-label="Deneyim">
            <span style={{ width: `${(XP / XP_MAX) * 100}%` }} />
          </div>
          <p className="xp-label">
            {new Intl.NumberFormat("tr-TR").format(XP)} / {new Intl.NumberFormat("tr-TR").format(XP_MAX)}
          </p>
        </section>

        <section className="frame ladder">
          <h3 className="panel-title">RÜTBE BASAMAKLARI</h3>
          {RANKS.map((rank) => {
            const Icon = rank.icon;
            return (
              <div key={rank.name} className={rank.active ? "row active" : "row"}>
                <Icon className="mark" aria-hidden />
                <span>{rank.name}</span>
                <small>
                  {rank.range}
                  {rank.active ? " ✓" : ""}
                </small>
              </div>
            );
          })}
        </section>

        <section className="frame quests">
          <h3 className="panel-title">GÖREVLER</h3>
          {save.tasks.map((task) => {
            const done = task.progress >= task.goal;
            return (
              <button key={task.id} className="task" onClick={() => onTask(task.id)} disabled={done}>
                <img src={task.icon} alt="" />
                <span>
                  <b>{task.title}</b>
                  <p>{task.detail}</p>
                  <div className="bar">
                    <span style={{ width: `${(task.progress / task.goal) * 100}%` }} />
                  </div>
                </span>
                <span className="check">
                  {task.progress}/{task.goal}
                  {done ? " ✓" : ""}
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Section({
  tab,
  save,
  setSave,
  note,
}: {
  tab: TabId;
  save: Save;
  setSave: (fn: (s: Save) => Save) => void;
  note: (t: string) => void;
}) {
  if (tab === "envanter") {
    const items = [
      { id: "saat", name: "Cep saati", detail: "Karagümrük hatırası. Prestij +1." },
      { id: "palto", name: "Siyah palto", detail: "Gece işleri için. 180.000 ₺" },
      { id: "defter", name: "Muhbir defteri", detail: "İsimler ve borçlar. 95.000 ₺" },
    ];
    return (
      <div className="page">
        <h2>ENVANTER</h2>
        {items.map((item) => {
          const owned = save.owned.includes(item.id);
          return (
            <article key={item.id} className="frame card">
              <div>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </div>
              <button
                className="ghost"
                disabled={owned}
                onClick={() => {
                  if (item.id === "saat") return;
                  const cost = item.id === "palto" ? 180000 : 95000;
                  if (save.money < cost) {
                    note("Para yetmiyor");
                    return;
                  }
                  setSave((s) => ({ ...s, money: s.money - cost, owned: [...s.owned, item.id] }));
                  note("Envantere eklendi");
                }}
              >
                {owned ? "SAHİP" : "AL"}
              </button>
            </article>
          );
        })}
      </div>
    );
  }

  if (tab === "silahlar") {
    return (
      <div className="page">
        <h2>SİLAHLAR</h2>
        <article className="frame card">
          <div>
            <h3>9mm tabanca</h3>
            <p>Kuşanılı. Mermi stoğu üst barda.</p>
          </div>
          <span className="check">AKTİF</span>
        </article>
        <article className="frame card">
          <div>
            <h3>Susturucu</h3>
            <p>Gece operasyonu. 60.000 ₺</p>
          </div>
          <button
            className="ghost"
            onClick={() => {
              if (save.money < 60000) {
                note("Para yetmiyor");
                return;
              }
              setSave((s) => ({ ...s, money: s.money - 60000 }));
              note("Susturucu alındı");
            }}
          >
            AL
          </button>
        </article>
      </div>
    );
  }

  if (tab === "adamlar") {
    const crew = [
      ["Rıza", "Karagümrük — tahsilat"],
      ["Cemil", "Eminönü — gözcü"],
      ["Tarık", "Karaköy — şoför"],
    ];
    return (
      <div className="page">
        <h2>ADAMLARIM</h2>
        {crew.map(([name, role]) => (
          <article key={name} className="frame card">
            <div>
              <h3>{name}</h3>
              <p>{role}</p>
            </div>
            <Crown className="mark" />
          </article>
        ))}
      </div>
    );
  }

  if (tab === "hapishane") {
    return (
      <div className="page">
        <h2>HAPİSHANE</h2>
        <article className="frame card">
          <div>
            <h3>{save.jailed ? "İçeridesin" : "Temizsin"}</h3>
            <p>
              {save.jailed
                ? "Kefalet 150.000 ₺. Ödeyince sokağa çıkarsın."
                : "Dosyan kapalı. Bir hata yaparsan burası seni bekler."}
            </p>
          </div>
          {save.jailed ? (
            <button
              className="ghost"
              onClick={() => {
                if (save.money < 150000) {
                  note("Kefalet yetmiyor");
                  return;
                }
                setSave((s) => ({ ...s, money: s.money - 150000, jailed: false }));
                note("Serbestsin");
              }}
            >
              KEFALET
            </button>
          ) : (
            <button className="ghost" onClick={() => setSave((s) => ({ ...s, jailed: true }))}>
              RİSK
            </button>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>AYARLAR</h2>
      <article className="frame card">
        <div>
          <h3>Ses</h3>
          <p>Şehir uğultusu ve bildirimler.</p>
        </div>
        <button
          className={save.sound ? "toggle on" : "toggle"}
          aria-pressed={save.sound}
          onClick={() => setSave((s) => ({ ...s, sound: !s.sound }))}
        >
          <i />
        </button>
      </article>
      <article className="frame card">
        <div>
          <h3>Bildirim</h3>
          <p>Aile ve görev uyarıları.</p>
        </div>
        <button
          className={save.notify ? "toggle on" : "toggle"}
          aria-pressed={save.notify}
          onClick={() => setSave((s) => ({ ...s, notify: !s.notify }))}
        >
          <i />
        </button>
      </article>
    </div>
  );
}
