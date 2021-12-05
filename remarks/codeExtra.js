const parseParameters = (paramText) => {
  const chrPositions = (code, chr) => {
    if (!code.includes(chr)) return [];
    const pos = code.lastIndexOf(chr);
    const head = code.substr(0, pos);
    return [chrPositions(head, chr), pos].flat();
  };

  const qAreas = (positions) => {
    if (positions.length % 2 !== 0) {
      throw new Error('クオーテーションの数が一致しません');
    }
    if (positions.length === 0) {
      return [];
    }
    return [{ start: positions[0], end: positions[1] }, qAreas(positions.slice(2))].flat();
  };

  const isInsideQ = (pos, areas) => {
    return areas.reduce((pre, curr) => {
      return pre || (curr.start <= pos && pos <= curr.end);
    }, false);
  };
  const validPoints = (commas, areas) => {
    return commas.reduce((pre, curr) => {
      if (!isInsideQ(curr, areas)) {
        return [pre, curr].flat();
      }
      return pre;
    }, []);
  };

  const split = (code, positions) => {
    if (positions.length === 0) return [code];
    const pos = positions[positions.length - 1];
    const head = code.substr(0, pos);
    const tail = code.substr(pos + 1);
    return [split(head, positions.slice(0, -1)), tail].flat();
  };

  const removeQuotes = (code) => {
    const isQuoted = code[0] === '"' && code[code.length - 1] === '"';
    return isQuoted ? code.substr(0, code.length - 1).substr(1) : code;
  };

  const parsePart = (code) => {
    const qs = chrPositions(code, '"');
    if (qs.length === 0) {
      if (chrPositions(code, '=').length !== 1) {
        throw new Error(`不正な=が含まれています [${code}]`);
      }
      const kv = code.split('=');
      return kv.map((e) => e.trim());
    } else if (qs.length === 2) {
      const eqpos = validPoints(chrPositions(code, '='), qAreas(qs));
      if (eqpos.length !== 1) {
        throw new Error(`不正な=が含まれています [${code}]`);
      }
      const [key, value] = split(code, eqpos);
      return [key, removeQuotes(value)].map((e) => e.trim());
    }
  };

  const qareas = qAreas(chrPositions(paramText, '"'));
  const commas = chrPositions(paramText, ',');
  const spPoints = validPoints(commas, qareas);
  const parts = split(paramText, spPoints);
  const parsed = parts.map((part) => parsePart(part));
  return Object.fromEntries(parsed);
};

const parseMeta = (meta) => parseParameters(meta);

const remarkCodeExtraConfig = {
  transform: (node) => {
    if (node.meta) {
      const params = parseMeta(node.meta);
      let before = [];
      if (params.title !== undefined) {
        before.push({
          type: 'element',
          tagName: 'div',
          properties: {
            class: 'filename',
          },
          children: [
            {
              type: 'text',
              value: params.title,
            },
          ],
        });
      }

      return {
        before,
      };
    } else {
      return null;
    }
  },
};

export default remarkCodeExtraConfig;
