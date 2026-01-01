const { useState, useRef, useEffect } = React;

function App() {
  let history = [];
  const [image, setImage] = useState(null);
  const [center, setCenter] = useState(null);
  history.push(JSON.parse(JSON.stringify(shots)));

  const [shots, setShots] = useState([]);
  const [result, setResult] = useState(null);
  const [manualCenter, setManualCenter] = useState(false);

  const imgRef = useRef(null);

  const errorMap = {
    "فوق": {
      ar: "دفع المعصم للأعلى أثناء خروج الطلقة",
      en: "Breaking wrist up",
      fix: "ثبات المعصم والحفاظ على استقامة السحب"
    },
    "فوق يمين": {
      ar: "الضغط بكعب اليد مع توقع الارتداد",
      en: "Heeling (anticipating recoil)",
      fix: "توزيع الضغط بالتساوي داخل القبضة"
    },
    "يمين": {
      ar: "الضغط بالإبهام أو زيادة سحب الزناد",
      en: "Thumbing or too much trigger finger",
      fix: "إرخاء الإبهام وسحب الزناد بشكل مستقيم"
    },
    "تحت يمين": {
      ar: "زيادة شدة القبضة أثناء السحب",
      en: "Tightening grip while pulling trigger",
      fix: "فصل حركة الزناد عن القبضة"
    },
    "تحت": {
      ar: "دفع المعصم للأسفل أو انخفاض الرأس",
      en: "Breaking wrist down or drooping head",
      fix: "الحفاظ على الرأس والمعصم ثابتين"
    },
    "تحت شمال": {
      ar: "نش الزناد أو السحب المفاجئ",
      en: "Jerking or slapping trigger",
      fix: "سحب الزناد تدريجيًا وبسلاسة"
    },
    "شمال": {
      ar: "شد باقي الأصابع أثناء السحب",
      en: "Tightening fingers",
      fix: "إرخاء الأصابع غير العاملة"
    },
    "فوق شمال": {
      ar: "السحب بطرف الإصبع السبابة",
      en: "Too little trigger finger",
      fix: "إدخال الإصبع على الزناد بشكل أعمق"
    }
  };

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setShots([]);
      setResult(null);
      setCenter(null);
      setManualCenter(false);
    };
    reader.readAsDataURL(file);
  }

  function setAutoCenter() {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setCenter({ x: r.width / 2, y: r.height / 2 });
  }

  function handleImageClick(e) {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    if (!center || manualCenter) {
      setCenter({ x, y });
      setManualCenter(false);
      return;
    }

    setShots(prev => [...prev, { x, y }]);
  }

  function analyzeShots() {
    if (!center || shots.length === 0) {
      alert("لا توجد طلقات للتحليل");
      return;
    }

    const directions = shots.map(s => {
      const dx = s.x - center.x;
      const dy = center.y - s.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      if (angle >= 337.5 || angle < 22.5) return "يمين";
      if (angle < 67.5) return "فوق يمين";
      if (angle < 112.5) return "فوق";
      if (angle < 157.5) return "فوق شمال";
      if (angle < 202.5) return "شمال";
      if (angle < 247.5) return "تحت شمال";
      if (angle < 292.5) return "تحت";
      return "تحت يمين";
    });

    const count = {};
    directions.forEach(d => count[d] = (count[d] || 0) + 1);

    const dominant = Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );

    setResult({
      direction: dominant,
      shots: count[dominant],
      ...errorMap[dominant]
    });
  }

  useEffect(() => {
    if (image) setTimeout(setAutoCenter, 100);
  }, [image]);

  return (
    React.createElement("div", { style: styles.container },
      React.createElement("h1", null, "Shehaby Shooting Pro"),

      React.createElement("input", {
        type: "file",
        accept: "image/*",
        onChange: handleImageUpload
      }),

      image && React.createElement("div", { style: styles.imageBox },
        React.createElement("img", {
          src: image,
          ref: imgRef,
          onClick: handleImageClick,
          style: styles.image
        }),
        center && React.createElement("div", {
          style: { ...styles.centerMark, left: center.x - 6, top: center.y - 6 }
        }),
        shots.map((s, i) =>
          React.createElement("div", {
            key: i,
            style: { ...styles.shot, left: s.x - 7, top: s.y - 7 }
          }, i + 1)
        )
      ),

      image && React.createElement("button", {
        onClick: () => setManualCenter(true),
        style: styles.button
      }, "تحديد مركز الهدف يدويًا"),

      image && React.createElement("button", {
        onClick: analyzeShots,
        style: styles.analyzeButton
      }, "ابدأ تحليل الأخطاء"),

      result && React.createElement("div", { style: styles.resultBox },
        React.createElement("h3", null, "الخطأ الغالب"),
        React.createElement("p", null, result.ar),
        React.createElement("p", null, result.en),
        React.createElement("p", null, "التصحيح: " + result.fix)
      )
    )
  );
}

const styles = {
  container: { fontFamily: "Arial", padding: 15, textAlign: "center" },
  imageBox: { position: "relative", display: "inline-block", marginTop: 15 },
  image: { maxWidth: "100%", border: "2px solid #000" },
  centerMark: {
    position: "absolute", width: 12, height: 12,
    borderLeft: "2px solid red", borderTop: "2px solid red",
    transform: "rotate(45deg)", pointerEvents: "none"
  },
  shot: {
    position: "absolute", width: 14, height: 14, borderRadius: "50%",
    background: "blue", color: "#fff", fontSize: 10,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  button: { marginTop: 10, padding: "8px 15px" },
  analyzeButton: {
    marginTop: 10, marginLeft: 10,
    padding: "10px 20px", background: "#000", color: "#fff"
  },
  resultBox: { marginTop: 20, textAlign: "right" }
};

ReactDOM.createRoot(document.getElementById("root"))

  .render(React.createElement(App));
