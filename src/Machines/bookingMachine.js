import { createMachine, assign, fromPromise } from 'xstate'
import { fetchCountries } from '../Utils/api'

const fillCountries = {
    initial: "loading",
    states: {
        loading: {
            invoke: {
                id: 'getCountries',
                src: fromPromise(() => fetchCountries()),
                onDone: {
                    target: 'success',
                    actions: assign({
                        countries: ({event}) => event.output
                    })
                },
                onError: {
                    target: 'failure',
                    actions: assign({
                        error: assign({error: 'Fallo el request'})
                    })
                }
            }
        },
        success: {},
        failure: {
            on: {
                RETRY: {
                    target: 'loading'
                }
            }
        }
    }
}

const bookingMachine = createMachine({
    id: 'buy plane tickets',
    initial: 'initial',
    context: {
        passengers: [],
        selectedCountry: '',
        countries: [],
        error: ''
    },
    states: {
        initial: {
            //entry: 'limpiarCampos',
            on: {
                START: {
                    target: 'search',
                    //actions: 'imprimirInicio'
                }
            }
        },
        search: {
            //entry: 'imprimirEntrada',
            //exit: 'imprimirSalida',
            on: {
                CONTINUE: {
                    target: 'passengers',
                    actions: assign({
                        selectedCountry: ({event}) => event.selectedCountry
                    })
                },
                CANCEL: 'initial'
            },
            ...fillCountries
        },
        passengers: {
            on: {
                DONE: 'tickets',
                CANCEL: {
                    target: 'initial',
                    actions: 'cleanContext'
                },
                ADD: {
                    target: 'passengers',
                    actions: assign(
                        ({context, event}) => context.passengers.push(event.newPassenger)
                    )
                }
            }
        },
        tickets: {
            after : {
                5000: {
                    target: 'initial',
                    actions: 'cleanContext'
                }
            },
            on: {
                FINISH: 'initial'
            }
        },
    }
},
{
    actions: {
        imprimirInicio: () => console.log('Imprimir inicio'),
        imprimirEntrada: () => console.log('Imprimir entrada a search'),
        imprimirSalida: () => console.log('Imprimir salida del search'),
        limpiarCampos: assign({
                passengers: [],
                selectedCountry: ''
            }),
        cleanContext: assign({
            passengers: [],
            selectedCountry: ''
        })
    }
})

export default bookingMachine