/**
 * jQuery-Widget für responsives Navigationsmenü.
 *
 * Das Widget implementiert ein flexibles Menüsystem, das automatisch zwischen
 * vertikalem und horizontalem Layout wechselt. Es verwaltet sowohl die Anzeige als auch
 * das interaktive Verhalten von mehrschichtigen Navigationsmenüs.
 *
 * Funktionalitäten:
 * - Automatischer Wechsel zwischen vertikalem und horizontalem Layout
 * - Konfigurierbare Responsive-Anpassung mit Breakpoint und Container-Element
 * - Unterstützung für verschachtelte Menüs mit Animation beim Ein- und Ausblenden
 * - Optionaler Maus-Hover-Modus für die horizontale Darstellung
 * - Automatische Schließung offener Untermenüs beim Klick außerhalb des Menüs
 * - Anpassbare CSS-Klassen für alle Menükomponenten
 *
 *
 * Autor:   K3nguruh <https://github.com/K3nguruh>
 * Version: 1.1.2
 * Datum:   2025-04-27 00:32
 * Lizenz:  MIT-Lizenz
 */
(function ($) {
  $.widget("custom.menu", {
    /**
     * Optionen für das Menü-Widget
     *
     * Diese Optionen definieren die wichtigsten Parameter des Widgets, wie Hover-Verhalten,
     * Breakpoint, Animationsgeschwindigkeit und CSS-Klassen für verschiedene Menü-Elemente.
     * Sie können durch das Daten-Attribut `data-plugin` oder explizit beim Initialisieren
     * gesetzt werden.
     *
     * @typedef {Object} MenuOptions
     * @property {boolean} mouseHover - Aktiviert/deaktiviert die Hover-Funktionalität (Standard: false)
     * @property {number} breakpoint - Breite in Pixeln für den Layout-Wechsel (Standard: 1200)
     * @property {string} container - CSS-Selektor für die responsive Anpassung (Standard: "body")
     * @property {number} duration - Dauer der Animationen in Millisekunden (Standard: 200)
     * @property {string} easing - Art des Easings für Animationen (Standard: "linear")
     * @property {Object} classes - CSS-Klassennamen, die vom Widget verwendet werden
     * @property {string} classes.menu - Basis-Klasse für das Menü (Standard: "menu")
     * @property {string} classes.menuHorizontal - Klasse für den horizontalen Modus (Standard: "menu-horizontal")
     * @property {string} classes.menuVertical - Klasse für den vertikalen Modus (Standard: "menu-vertical")
     * @property {string} classes.menuList - Klasse für Menülisten (Standard: "menu-list")
     * @property {string} classes.menuItem - Klasse für Menüitems (Standard: "menu-item")
     * @property {string} classes.menuLink - Klasse für Menülinks (Standard: "menu-link")
     * @property {string} classes.menuText - Klasse für Menütexte (Standard: "menu-text")
     * @property {string} classes.menuIcon - Klasse für Menüsymbole (Standard: "menu-icon")
     * @property {string} classes.active - Klasse für aktive Menülinks (Standard: "active")
     */
    options: {
      mouseHover: false,
      breakpoint: 1200,
      container: "body",
      duration: 200,
      easing: "linear",
      classes: {
        menu: "menu",
        menuHorizontal: "menu-horizontal",
        menuVertical: "menu-vertical",
        menuList: "menu-list",
        menuItem: "menu-item",
        menuLink: "menu-link",
        menuText: "menu-text",
        menuIcon: "menu-icon",
        active: "active",
      },
    },

    /**
     * Wird beim Erstellen des Widgets aufgerufen.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Führt die Standard-Optionen mit benutzerdefinierten Daten-Attributen zusammen
     * 2. Speichert eine Referenz auf die Klassendefinitionen für schnelleren Zugriff
     * 3. Initialisiert die Widget-Struktur durch Aufruf von _initWidget()
     * 4. Bindet alle erforderlichen Event-Handler durch Aufruf von _initEvents()
     * 5. Passt das Menü an die aktuelle Bildschirmgröße durch Aufruf von _resizeMenu() an
     *
     * @private
     * @return {void}
     */
    _create: function () {
      this.options = $.extend(true, {}, this.options, this.element.data());
      this.classes = this.options.classes;

      this._initWidget();
      this._initEvents();
      this._resizeMenu();
    },

    /**
     * Initialisiert Widget-Elemente und fügt CSS-Klassen hinzu.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Erfasst globale Objekte (window, document) und den konfigurierten Container als jQuery-Objekte
     * 2. Erfasst alle relevanten Menü-Elemente und speichert sie als jQuery-Objekte
     * 3. Weist jedem Element-Typ die entsprechende CSS-Klasse zu
     * 4. Fügt Icon-Elemente zu Menülinks hinzu, die Submenüs enthalten
     *
     * @private
     * @return {void}
     */
    _initWidget: function () {
      this.$window = $(window);
      this.$document = $(document);

      this.$container = $(this.options.container);

      this.$menu = this.element;
      this.$menuLists = this.$menu.find("ul");
      this.$menuItems = this.$menuLists.children("li");
      this.$menuLinks = this.$menuItems.children("a");
      this.$menuTexts = this.$menuItems.children("div");

      this.$menu.addClass(this.classes.menu);
      this.$menuLists.addClass(this.classes.menuList);
      this.$menuItems.addClass(this.classes.menuItem);
      this.$menuLinks.addClass(this.classes.menuLink);
      this.$menuTexts.addClass(this.classes.menuText);

      this.$menuLinks = this.$menuLinks.filter(":not(:only-child)").append($("<span></span>", { "class": this.classes.menuIcon }));
    },

    /**
     * Bindet Event-Handler an Widget-Elemente.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Registriert einen Resize-Handler auf dem Window-Objekt zur Layout-Anpassung
     * 2. Registriert einen Click-Handler auf dem Dokument für Clicks außerhalb des Menüs
     * 3. Registriert einen Click-Handler auf Menülinks für das Ein-/Ausklappen
     * 4. Registriert optional Maus-Event-Handler für Hover-Funktionalität
     *
     * Die Event-Bindung verwendet die jQuery UI _on-Methode für automatische Event-Bereinigung
     * beim Zerstören des Widgets.
     *
     * @private
     * @return {void}
     */
    _initEvents: function () {
      this._on(this.$window, { "resize": "_onResizeWindow" });
      this._on(this.$document, { "click": "_onClickDocument" });
      this._on(this.$menu, { "click li > a": "_onClickLink" });

      if (this.options.mouseHover) {
        this._on(this.$menu, { "mouseenter li": "_onEnterItem" });
        this._on(this.$menu, { "mouseleave li": "_onLeaveItem" });
      }
    },

    /**
     * Behandelt das Resize-Event und passt das Menü an.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Bricht laufende Animation-Frame-Anfragen ab, wenn vorhanden
     * 2. Nutzt requestAnimationFrame für optimierte Performance
     * 3. Ruft die _resizeMenu-Methode auf, die die Container-Breite prüft
     *
     * @private
     * @param {Event} event - Das Resize-Event
     * @return {void}
     */
    _onResizeWindow: function (event) {
      if (this.resizeAnimationFrame) cancelAnimationFrame(this.resizeAnimationFrame);
      this.resizeAnimationFrame = requestAnimationFrame(() => this._resizeMenu());
    },

    /**
     * Behandelt Click-Events außerhalb des Menüs.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Prüft, ob der Click außerhalb aller Menülisten und Dialoge erfolgte
     * 2. Ruft bei Bestätigung die _resetMenuList-Methode auf, um alle offenen Menüs zu schließen
     *
     * @private
     * @param {Event} event - Das Click-Event
     * @return {void}
     */
    _onClickDocument: function (event) {
      if (!$(event.target).closest(this.$menuLists).length && !$(event.target).closest('[role="dialog"]').length) {
        this._resetMenuList(this.options.duration);
      }
    },

    /**
     * Behandelt Click-Events auf Menülinks.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Identifiziert den geklickten Menülink und sein zugehöriges Submenü
     * 2. Beendet die Verarbeitung, wenn kein Submenü vorhanden ist
     * 3. Verhindert das Standard-Link-Verhalten mit preventDefault()
     * 4. Identifiziert weitere betroffene Menüelemente (Submenüs und andere Menülisten)
     * 5. Führt abgestimmte Aktionen für alle identifizierten Menülisten aus
     *
     * @private
     * @param {Event} event - Das Click-Event
     * @return {void}
     */
    _onClickLink: function (event) {
      const $menuLink = $(event.currentTarget);
      const $menuList = $menuLink.siblings("ul");

      if (!$menuList.length) return;

      event.preventDefault();

      const $subList = $menuList.find("ul");
      const $allList = this.$menuLists.not($menuList).not($menuList.parents("ul"));

      this._handleMenuList($menuList);
      this._handleMenuList($subList, false);
      this._handleMenuList($allList, false);
    },

    /**
     * Behandelt Mouse-Enter-Events auf Menüitems.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Identifiziert das Menüitem, über dem der Mauszeiger schwebt
     * 2. Prüft, ob das Menüitem ein Submenü enthält und ob der Desktop-Modus aktiv ist
     * 3. Zeigt bei positiver Prüfung das Submenü automatisch an
     *
     * @private
     * @param {Event} event - Das Mouse-Enter-Event
     * @return {void}
     */
    _onEnterItem: function (event) {
      const $menuItem = $(event.currentTarget);
      const $menuList = $menuItem.children("ul");

      if (!$menuList.length || this.isVertical) return;

      this._handleMenuList($menuList, true);
    },

    /**
     * Behandelt Mouse-Leave-Events auf Menüitems.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Identifiziert das Menüitem, das der Mauszeiger verlassen hat
     * 2. Prüft, ob das Menüitem ein Submenü enthält und ob der Desktop-Modus aktiv ist
     * 3. Schließt bei positiver Prüfung das Submenü sofort
     *
     * @private
     * @param {Event} event - Das Mouse-Leave-Event
     * @return {void}
     */
    _onLeaveItem: function (event) {
      const $menuItem = $(event.currentTarget);
      const $menuList = $menuItem.children("ul");

      if (!$menuList.length || this.isVertical) return;

      this._handleMenuList($menuList, false);
    },

    /**
     * Passt das Menü basierend auf der Container-Breite an.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Ermittelt den Anzeigemodus anhand der aktuellen Container-Breite
     * 2. Vergleicht den ermittelten Modus mit dem aktuell gesetzten Status
     * 3. Aktualisiert bei Änderung den internen Status und wendet das entsprechende Layout an
     *
     * @private
     * @return {void}
     */
    _resizeMenu: function () {
      const isVertical = this.$container.width() < this.options.breakpoint;

      if (this.isVertical !== isVertical) {
        this.isVertical = isVertical;
        this[isVertical ? "_applyMenuVertical" : "_applyMenuHorizontal"]();
        this._resetMenuList(0);
      }
    },

    /**
     * Wendet die vertikale Ansicht auf das Menü an.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Fügt die vertikale CSS-Klasse zum Menü hinzu
     * 2. Entfernt die horizontale CSS-Klasse vom Menü
     *
     * @private
     * @return {void}
     */
    _applyMenuVertical: function () {
      this.$menu.addClass(this.classes.menuVertical);
      this.$menu.removeClass(this.classes.menuHorizontal);
    },

    /**
     * Wendet die horizontale Ansicht auf das Menü an.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Fügt die horizontale CSS-Klasse zum Menü hinzu
     * 2. Entfernt die vertikale CSS-Klasse vom Menü
     *
     * @private
     * @return {void}
     */
    _applyMenuHorizontal: function () {
      this.$menu.addClass(this.classes.menuHorizontal);
      this.$menu.removeClass(this.classes.menuVertical);
    },

    /**
     * Steuert die Anzeige von Menülisten mit Animation.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Bestimmt die zu verwendende jQuery-Animationsmethode basierend auf dem Status
     * 2. Bestimmt die zu verwendende Klassenmethode (hinzufügen/entfernen/umschalten)
     * 3. Führt die Animation auf der Menüliste aus
     * 4. Aktualisiert den aktiven Status auf dem zugehörigen Link-Element
     *
     * @private
     * @param {jQuery} $menuList - Die zu manipulierende Menüliste als jQuery-Objekt
     * @param {boolean|null} state - Zustand (true = öffnen, false = schließen, null = umschalten)
     * @return {void}
     */
    _handleMenuList: function ($menuList, state = null) {
      const handle = (toggle, open, close) => (state === null ? toggle : state === true ? open : close);

      $menuList.finish()[handle("slideToggle", "slideDown", "slideUp")](this.options.duration, this.options.easing);
      $menuList.siblings("a")[handle("toggleClass", "addClass", "removeClass")](this.classes.active);
    },

    /**
     * Setzt alle Submenüs auf ihren geschlossenen Zustand zurück.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Schließt alle Submenülisten (alle außer der obersten Ebene) mit Animation
     * 2. Entfernt die aktive Klasse von allen Menülinks
     *
     * @private
     * @param {number} duration - Dauer der Animation in Millisekunden
     * @return {void}
     */
    _resetMenuList: function (duration) {
      this.$menuLists.slice(1).finish().slideUp(duration, this.options.easing);
      this.$menuLinks.removeClass(this.classes.active);
    },

    /**
     * Zerstört das Widget und setzt alle Änderungen zurück.
     *
     * Diese Methode führt folgende Schritte aus:
     * 1. Entfernt alle vom Widget hinzugefügten CSS-Klassen
     * 2. Entfernt alle vom Widget hinzugefügten Elemente
     *
     * @public
     * @return {void}
     */
    destroy: function () {
      this.$menu.removeClass(this.classes.menu);
      this.$menu.removeClass(this.classes.menuHorizontal);
      this.$menu.removeClass(this.classes.menuVertical);
      this.$menuLists.removeClass(this.classes.menuList);
      this.$menuItems.removeClass(this.classes.menuItem);
      this.$menuLinks.removeClass(this.classes.menuLink);
      this.$menuLinks.removeClass(this.classes.active);
      this.$menuTexts.removeClass(this.classes.menuText);

      this.$menu.find(`.${this.classes.menuIcon}`).remove();
    },
  });

  /**
   * Automatische Initialisierung des Widgets.
   *
   * Selektiert alle DOM-Elemente mit dem Datenattribut 'data-plugin="menu"' und
   * initialisiert für jedes gefundene Element eine neue Instanz des Menü-Widgets.
   * Diese Selbst-Initialisierung ermöglicht eine deklarative Konfiguration direkt
   * im HTML ohne manuelle JavaScript-Initialisierung.
   *
   * Die Initialisierung erfolgt nach dem vollständigen Laden des DOM.
   */
  $(function () {
    $('[data-plugin="menu"]').menu();
  });
})(jQuery);
