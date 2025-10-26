import {
  SPECIES_OPTIONS,
  BACKGROUND_OPTIONS,
  ASPIRATION_OPTIONS,
  ATTRIBUTE_LIST,
  STARTING_ATTRIBUTES,
  COMPANION_LIBRARY,
  SKILL_LIBRARY
} from "../data/options.js";

export function createCharacterCreationView(container, { onComplete }) {
  const element = document.createElement("div");
  element.className = "card";

  const heading = document.createElement("div");
  heading.innerHTML = `
    <h1>Morrowfell Academy Intake</h1>
    <p>Craft your initiate, set their aspirations, and prepare for your first night on campus.</p>
  `;
  element.append(heading);

  const form = document.createElement("form");
  form.className = "section";

  const nameField = document.createElement("input");
  nameField.type = "text";
  nameField.placeholder = "Preferred name";
  nameField.value = "";
  nameField.ariaLabel = "Character name";

  const speciesSelect = buildSelect(
    SPECIES_OPTIONS.map((s) => ({ value: s.name, label: `${s.name} — ${s.resource}` })),
    "Species"
  );

  const backgroundSelect = buildSelect(
    BACKGROUND_OPTIONS.map((label) => ({ value: label, label })),
    "Background"
  );

  const aspirationSelect = buildSelect(
    ASPIRATION_OPTIONS.map((label) => ({ value: label, label })),
    "Aspiration"
  );

  const pointsState = {
    pool: 3,
    values: { ...STARTING_ATTRIBUTES }
  };

  const statBlock = document.createElement("div");
  statBlock.className = "stat-block";
  ATTRIBUTE_LIST.forEach((attribute) => {
    const statEl = document.createElement("div");
    statEl.className = "stat";
    statEl.innerHTML = `
      <label>${attribute.name}</label>
      <span data-value="${attribute.id}">${pointsState.values[attribute.id]}</span>
      <div class="actions">
        <button type="button" data-action="dec" data-attr="${attribute.id}">–</button>
        <button type="button" data-action="inc" data-attr="${attribute.id}">+</button>
      </div>
      <p>${attribute.description}</p>
    `;
    statBlock.append(statEl);
  });

  const pointsNotice = document.createElement("p");
  pointsNotice.textContent = `Talent points remaining: ${pointsState.pool}`;

  statBlock.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const attr = button.dataset.attr;
    const action = button.dataset.action;
    const current = pointsState.values[attr];
    if (action === "inc" && pointsState.pool > 0) {
      pointsState.values[attr] = current + 1;
      pointsState.pool -= 1;
    } else if (action === "dec" && current > STARTING_ATTRIBUTES[attr]) {
      pointsState.values[attr] = current - 1;
      pointsState.pool += 1;
    }
    updateStatDisplay(statBlock, pointsState.values);
    pointsNotice.textContent = `Talent points remaining: ${pointsState.pool}`;
    validate();
  });

  const speciesInfo = document.createElement("div");
  speciesInfo.className = "panel";
  speciesInfo.innerHTML = renderSpeciesInfo(SPECIES_OPTIONS[0]);

  speciesSelect.select.addEventListener("change", () => {
    const match = SPECIES_OPTIONS.find((s) => s.name === speciesSelect.select.value);
    speciesInfo.innerHTML = renderSpeciesInfo(match);
    validate();
  });

  backgroundSelect.select.addEventListener("change", () => validate());
  aspirationSelect.select.addEventListener("change", () => validate());

  const companionPanel = document.createElement("div");
  companionPanel.className = "panel";
  companionPanel.innerHTML = renderCompanionSpotlight();

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Enter Morrowfell";
  submit.disabled = true;

  form.append(createLabeledField("Preferred Name", nameField));
  form.append(createInlineRow(speciesSelect.element, backgroundSelect.element, aspirationSelect.element));
  form.append(pointsNotice);
  form.append(statBlock);
  form.append(companionPanel);
  form.append(speciesInfo);
  form.append(submit);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!submit.disabled) {
      onComplete({
        name: nameField.value.trim() || "Initiate",
        species: speciesSelect.select.value,
        background: backgroundSelect.select.value,
        aspiration: aspirationSelect.select.value,
        attributes: { ...pointsState.values }
      });
    }
  });

  const logPanel = document.createElement("div");
  logPanel.className = "panel";
  logPanel.innerHTML = renderFirstHourSlice();

  const wrapper = document.createElement("div");
  wrapper.className = "flex-row";
  wrapper.append(form, logPanel);

  element.append(wrapper);

  validate();

  return {
    element,
    destroy: () => {},
    update: () => {}
  };

  function validate() {
    submit.disabled =
      !speciesSelect.select.value ||
      !backgroundSelect.select.value ||
      !aspirationSelect.select.value ||
      pointsState.pool !== 0;
  }
}

function buildSelect(options, labelText) {
  const wrapper = document.createElement("label");
  wrapper.className = "section";
  const label = document.createElement("span");
  label.textContent = labelText;
  const select = document.createElement("select");
  select.innerHTML = options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");
  wrapper.append(label, select);
  return { element: wrapper, select };
}

function createLabeledField(labelText, inputElement) {
  const wrapper = document.createElement("label");
  wrapper.className = "section";
  const label = document.createElement("span");
  label.textContent = labelText;
  wrapper.append(label, inputElement);
  return wrapper;
}

function createInlineRow(...elements) {
  const row = document.createElement("div");
  row.className = "form-grid";
  elements.forEach((el) => row.append(el));
  return row;
}

function updateStatDisplay(container, values) {
  container.querySelectorAll("span[data-value]").forEach((span) => {
    const id = span.dataset.value;
    span.textContent = values[id];
  });
}

function renderSpeciesInfo(species) {
  if (!species) return "";
  return `
    <h2>${species.name} Lineage</h2>
    <p>${species.description}</p>
    <div class="badge-row">
      <span class="badge">Resource: ${species.resource}</span>
      <span class="badge">Sunset Curfew 2 a.m.</span>
      <span class="badge">Non-lethal Mandate</span>
    </div>
    <h3>Sample Unlocks</h3>
    <ul class="quest-log">
      ${Object.values(SKILL_LIBRARY)
        .flat()
        .slice(0, 4)
        .map((skill) => `<li><strong>${skill.name}:</strong> ${skill.summary ?? skill.description ?? skill.effect ?? ""}</li>`)
        .join("")}
    </ul>
  `;
}

function renderCompanionSpotlight() {
  return `
    <h2>Available Cohort</h2>
    <p>Choose companions during play. Each ally has a signature technique and support passive.</p>
    <ul class="quest-log">
      ${COMPANION_LIBRARY.map(
        (companion) => `
          <li>
            <strong>${companion.name}</strong> — ${companion.species} ${companion.role}<br />
            ${companion.description}<br />
            <em>Signature:</em> ${companion.signature}<br />
            <em>Support:</em> ${companion.passive}
          </li>
        `
      ).join("")}
    </ul>
  `;
}

function renderFirstHourSlice() {
  return `
    <h2>First Hour Beat Sheet</h2>
    <ol class="quest-log">
      <li>Orientation interview with Deputy Warden Myria (Resolve or Diplomacy check).</li>
      <li>Campus tour culminating in a tutorial skirmish beneath the Fell Keep.</li>
      <li>Choose your first companion: Isolde or Bram.</li>
      <li>Undertake the Hollowmere evening patrol and learn to manage Veil Heat.</li>
    </ol>
  `;
}
