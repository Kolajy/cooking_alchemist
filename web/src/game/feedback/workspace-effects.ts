const FLASH_CLASSES = [
  "workspace-action-flash--success",
  "workspace-action-flash--fail",
  "workspace-action-flash--press"
];

export function flashWorkspace(workspace, outcome) {
  if (!workspace) return;

  workspace.classList.remove(...FLASH_CLASSES);
  void workspace.offsetWidth;

  if (outcome === true) {
    workspace.classList.add("workspace-action-flash--success");
  } else if (outcome === false) {
    workspace.classList.add("workspace-action-flash--fail");
  } else {
    workspace.classList.add("workspace-action-flash--press");
  }

  setTimeout(() => {
    workspace.classList.remove(...FLASH_CLASSES);
  }, 520);
}

export function shakeWorkspace(workspace) {
  if (!workspace) return;

  workspace.classList.remove("workspace-shake");
  void workspace.offsetWidth;
  workspace.classList.add("workspace-shake");

  const onEnd = () => {
    workspace.classList.remove("workspace-shake");
    workspace.removeEventListener("animationend", onEnd);
  };
  workspace.addEventListener("animationend", onEnd);
}
