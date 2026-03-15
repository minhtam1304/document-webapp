const TAXONOMY = {
  co: {
    label: 'Co',
    topics: {
      dong_hoc: 'Dong hoc',
      dong_luc_hoc: 'Dong luc hoc',
      nang_luong: 'Nang luong',
      bau_troi: 'Bau troi',
      co_hoc_chat_luu: 'Co hoc chat luu',
    },
  },
  dien: {
    label: 'Dien',
    topics: {
      tong_quan: 'Tong quan',
    },
  },
  nhiet: {
    label: 'Nhiet',
    topics: {
      tong_quan: 'Tong quan',
    },
  },
  quang: {
    label: 'Quang',
    topics: {
      tong_quan: 'Tong quan',
    },
  },
};

const CONTENT_TYPES = {
  ly_thuyet: 'Co so ly thuyet',
  bai_tap: 'Bai tap',
};

function isValidTaxonomy(subject, topic, contentType) {
  if (!TAXONOMY[subject]) {
    return false;
  }

  if (!TAXONOMY[subject].topics[topic]) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(CONTENT_TYPES, contentType);
}

module.exports = {
  TAXONOMY,
  CONTENT_TYPES,
  isValidTaxonomy,
};
