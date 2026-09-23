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

  /* ---------- Formulário de orçamento -> CRM ---------- */
  // TODO(CRM): preencher com o endpoint do CRM quando estiver disponível.
  // Enquanto estiver vazio, o envio é simulado (nenhum dado sai do navegador).
  const CRM_ENDPOINT = "";
  const CRM_HEADERS = { "Content-Type": "application/json" };

  const form = $("#leadForm");
  const success = $("#formSuccess");
  const alertBox = $("#formAlert");
  const phone = $("#fPhone");
  const billInput = $("#fBill");

  // UTMs da URL para o CRM saber de onde veio o lead
  const params = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign"].forEach((k) => {
    if (params.get(k)) form.elements[k].value = params.get(k);
  });

  const onlyDigits = (v) => v.replace(/\D/g, "");
  phone.addEventListener("input", () => {
    const d = onlyDigits(phone.value).slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    phone.value = out;
  });
  billInput.addEventListener("input", () => {
    const d = onlyDigits(billInput.value).slice(0, 7);
    billInput.value = d ? Number(d).toLocaleString("pt-BR") : "";
  });

  const rules = {
    fName: (el) => el.value.trim().length >= 2,
    fPhone: (el) => onlyDigits(el.value).length >= 10,
    fEmail: (el) => !el.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
    fConsent: (el) => el.checked,
  };
  const validate = (id) => {
    const el = $("#" + id);
    const ok = rules[id](el);
    el.closest(".field").classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    el.setAttribute("aria-describedby", id + "Err");
    return ok;
  };
  Object.keys(rules).forEach((id) => {
    const el = $("#" + id);
    el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") validate(id); });
    el.addEventListener(el.type === "checkbox" ? "change" : "input", () => {
      if (el.closest(".field").classList.contains("is-invalid")) validate(id);
    });
  });

  async function sendLead(lead) {
    if (!CRM_ENDPOINT) {
      console.info("[W7] Lead (simulado, CRM ainda não configurado):", lead);
      await new Promise((r) => setTimeout(r, 1200));
      return;
    }
    const res = await fetch(CRM_ENDPOINT, { method: "POST", headers: CRM_HEADERS, body: JSON.stringify(lead) });
    if (!res.ok) throw new Error(`CRM respondeu ${res.status}`);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.hidden = true;
    const invalid = Object.keys(rules).filter((id) => !validate(id));
    if (invalid.length) {
      $("#" + invalid[0]).focus();
      return;
    }

    const data = new FormData(form);
    const get = (k) => (data.get(k) || "").toString().trim();
    const lead = {
      nome: get("nome"),
      telefone: "+55" + onlyDigits(get("telefone")),
      email: get("email") || null,
      cidade: get("cidade") || null,
      conta_media: get("conta") ? Number(onlyDigits(get("conta"))) : null,
      tipo_projeto: get("tipo"),
      consentimento_lgpd: true,
      origem: get("origem"),
      utm_source: get("utm_source") || null,
      utm_medium: get("utm_medium") || null,
      utm_campaign: get("utm_campaign") || null,
      pagina: location.href,
      enviado_em: new Date().toISOString(),
    };

    form.classList.add("is-loading");
    form.setAttribute("aria-busy", "true");
    try {
      await sendLead(lead);
      const first = lead.nome.split(" ")[0];
      $("#successName").textContent = first;
      $("#successWa").href = waLink(`Olá, W7 Energy! Sou ${lead.nome} e acabei de solicitar um orçamento pelo site (${lead.tipo_projeto}).`);
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (err) {
      console.error(err);
      alertBox.hidden = false;
    } finally {
      form.classList.remove("is-loading");
      form.removeAttribute("aria-busy");
    }
  });

  $("#formAgain").addEventListener("click", () => {
    form.reset();
    form.querySelectorAll(".is-invalid").forEach((f) => f.classList.remove("is-invalid"));
    success.hidden = true;
    form.hidden = false;
    $("#fName").focus();
  });

  /* ---------- Ano no rodapé ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
