'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;

      if (text === undefined || locale === undefined) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validLocales = ['american-to-british', 'british-to-american'];
      if (!validLocales.includes(locale)) {
        return res.json({ error: 'Invalid value for locale field' });
      }
      if (text === "") {
        return res.json({ error: 'No text to translate' });
      }

      const result = translator.translate(text, locale);
      res.json(result);
    });
};
