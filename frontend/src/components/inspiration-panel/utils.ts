const isInsideAnchor = (node: Node): boolean => {
  let parent = node.parentNode;
  while (parent) {
    if (parent instanceof HTMLAnchorElement) {
      return true;
    }
    parent = parent.parentElement ?? null;
  }
  return false;
};

export const autoLinkHtml = (html: string): string => {
  if (typeof window === "undefined") {
    return html;
  }

  const template = window.document.createElement("div");
  template.innerHTML = html;

  const walker = window.document.createTreeWalker(
    template,
    window.NodeFilter.SHOW_TEXT
  );

  const nodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const textNode = currentNode as Text;
    const value = textNode.nodeValue ?? "";
    if (
      value &&
      /(https?:\/\/[^\s<]+|www\.[^\s<]+)/i.test(value) &&
      !isInsideAnchor(textNode)
    ) {
      nodes.push(textNode);
    }
    currentNode = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? "";
    const fragment = window.document.createDocumentFragment();
    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const start = match.index;
      if (start > lastIndex) {
        fragment.appendChild(
          window.document.createTextNode(text.slice(lastIndex, start))
        );
      }

      const href =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      const anchor = window.document.createElement("a");
      anchor.href = href;
      anchor.textContent = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      fragment.appendChild(anchor);

      lastIndex = start + url.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(
        window.document.createTextNode(text.slice(lastIndex))
      );
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  return template.innerHTML;
};

export const applyAnchorAttributes = (root: HTMLElement): void => {
  root.querySelectorAll("a").forEach((anchor) => {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });
};

const CENTRAL_TIME_ZONE = "America/Chicago";

const centralTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: CENTRAL_TIME_ZONE,
  timeZoneName: "short",
});

export const formatSavedTime = (date: Date | null): string => {
  if (!date) {
    return "";
  }

  try {
    return `Saved ${centralTimeFormatter.format(date)}`;
  } catch {
    return `Saved ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
};
