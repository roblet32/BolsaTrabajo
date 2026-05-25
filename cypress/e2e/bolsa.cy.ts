describe('Bolsa de Trabajo E2E Tests', () => {
  beforeEach(() => {
    // Visitar la página antes de cada prueba
    cy.visit('/')
  })

  it('TC-01: Debería cargar la página principal correctamente', () => {
    // Verificar título principal
    cy.contains('Encuentra Expertos de Confianza').should('be.visible')
    // Verificar que existen las categorías
    cy.get('.categories-grid').should('exist')
  })

  it('TC-02: Debería seleccionar una categoría (Plomería)', () => {
    // Hacer clic en la tarjeta de plomería
    cy.get('#cat_card_plomeria').click()
    // Verificar que cambia la vista a mapa (debe existir un elemento map-panel o un mapa de leaflet)
    cy.get('.leaflet-container').should('exist')
  })

  it('TC-03: Debería cambiar el tema oscuro/claro', () => {
    // Al principio puede o no tener la clase, vamos a hacer clic y verificar que cambia
    cy.get('body').then(($body) => {
      const isLight = $body.hasClass('theme-light')
      cy.get('.btn-theme-toggle').click()
      if (isLight) {
        cy.get('body').should('not.have.class', 'theme-light')
      } else {
        cy.get('body').should('have.class', 'theme-light')
      }
    })
  })

  it('TC-04 & TC-05: Debería abrir el chatbot y poder cotizar un oficio', () => {
    // Abrir el chatbot
    cy.get('#btn_jalpi_chatbot').click()
    
    // Verificar que se abrió y está visible "Asistente Jalpi"
    cy.contains('Asistente Jalpi').should('be.visible')
    
    // Escribir en el input
    cy.get('#txt_chatbot_prompt').type('cotizar plomero')
    
    // Enviar
    cy.get('#btn_chatbot_send').click()
    
    // Verificar que el bot responde con precios (esperar un poco a que "piense")
    cy.contains('Estimado de Tarifas para', { timeout: 4000 }).should('be.visible')
    
    // Cerrar chatbot
    cy.get('.close-btn').click()
    
    // Verificar que el botón flotante regresa
    cy.get('#btn_jalpi_chatbot').should('be.visible')
  })
})
