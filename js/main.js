(function () {
  const WHATSAPP = "5527997214733";

  // Constantes do simulador (estimativa simplificada)
  const SAVING_RATE = 0.9;        // até 90% de economia
  const TARIFF = 1.0;             // R$/kWh médio
  const KWH_PER_KWP_MONTH = 125;  // geração típica no ES
  const PANEL_KWP = 0.575;        // módulo de ~575 W
  const YEARS = 25;

  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  /* ---------- Header ao rolar ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const nav = $("#nav");
  const toggle = $("#menuToggle");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Animação de entrada ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Simulador ---------- */
  const bill = $("#bill");
  const out = {
    bill: $("#billOut"),
    year: $("#resYear"),
    month: $("#resMonth"),
    total: $("#res25"),
    kwp: $("#resKwp"),
    panels: $("#resPanels"),
    cta: $("#simCta"),
  };

  function updateSim() {
    const v = Number(bill.value);
    const min = Number(bill.min), max = Number(bill.max);
    bill.style.setProperty("--p", `${((v - min) / (max - min)) * 100}%`);

    const month = v * SAVING_RATE;
    const year = month * 12;
    const total = year * YEARS;
    const kwh = v / TARIFF;
    const kwp = kwh / KWH_PER_KWP_MONTH;
    const panels = Math.max(1, Math.ceil(kwp / PANEL_KWP));

    out.bill.textContent = v >= max ? "10.000+" : v.toLocaleString("pt-BR");
    out.month.textContent = brl(month);
    out.year.textContent = brl(year);
    out.total.textContent = total >= 1e6
      ? `R$ ${(total / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
      : `R$ ${Math.round(total / 1000).toLocaleString("pt-BR")} mil`;
    out.kwp.textContent = `${kwp.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWp`;
    out.panels.textContent = `≈ ${panels} placas`;
    out.cta.href = waLink(`Olá, W7 Energy! Minha conta de luz é de aproximadamente ${brl(v)} por mês. Gostaria de um orçamento de energia solar.`);
  }
  bill.addEventListener("input", updateSim);
  updateSim();

  /* ---------- Formulário -> WhatsApp ---------- */
  const form = $("#leadForm");
  const error = $("#formError");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = (data.get("nome") || "").toString().trim();
    if (!nome) {
      error.hidden = false;
      $("#fName").focus();
      return;
    }
    error.hidden = true;
    const cidade = (data.get("cidade") || "").toString().trim();
    const conta = (data.get("conta") || "").toString().trim();
    const tipo = data.get("tipo");

    const lines = [
      `Olá, W7 Energy! Meu nome é ${nome}.`,
      `Gostaria de um orçamento de energia solar (${tipo}).`,
      cidade && `Cidade: ${cidade}`,
      conta && `Conta de luz média: R$ ${conta}`,
    ].filter(Boolean);

    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  /* ---------- Ano no rodapé ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
