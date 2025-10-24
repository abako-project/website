const states = require("../../core/state");

module.exports = exports = [
    {
        title: 'Servidor Quiz',
        description: 'Sevidor adivinanzas',
        summary: 'Servicio Web desarrollado con express',
        projectTypeId: 4,
        state: states.ProjectState.ProjectInProgress,
        url: 'https://quiz.dit.upm.es',
        budgetId: 1,
        deliveryTimeId: 4,
        deliveryDate: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)),
        clientId: 1,
        consultantId: 1,
        objectives: [
            "Diseñar arquitectura",
            "Crear esqueleto del projecto",
            "Implementar MVC",
            "Pruebas"
        ],
        constraints: [
            "Usar solo librerias gratuitas",
            "Publicar en Moodle"
        ],
        milestones: [
            {
                title: 'Prototipo',
                description: 'Desarrollo de un prototipo',
                budget: '3000',
                roleId: 1,
                proficiencyId: 1,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                state: states.MilestoneState.WaitingDeveloperAcceptAssignation,
                developerId: 2
            },
            {
                title: 'Producto Final',
                description: 'Desarrollo de un producto final',
                budget: '2000',
                roleId: 2,
                proficiencyId: 3,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (2 * 60 * 60 * 1000)),
                state: states.MilestoneState.MilestoneInProgress,
                developerId: 2
            },
        ]
    },
    {
        title: 'Gana el Último',
        description: 'SwiftUI App',
        summary: 'Aplicacion para iPhone',
        projectTypeId: 6,
        state: states.ProjectState.ProjectInProgress,
        url: 'https://dit.upm.es',
        budgetId: 2,
        deliveryTimeId: 4,
        deliveryDate: new Date(new Date().getTime() + (4 * 60 * 60 * 1000)),
        clientId: 1,
        consultantId: 2,
        objectives: [
            "Clonar ejemplo de IWEB",
            "Adaptar a SwiftUI 26"
        ],
        constraints: [
            "No subir nunca a la AppStore"
        ],
        milestones: [
            {
                title: 'Vistas',
                description: 'Desarrollo de las vistas',
                budget: '1000',
                roleId: 2,
                proficiencyId: 1,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                state: states.MilestoneState.WaitingClientAcceptSubmission,
                developerId: 2
            },
            {
                title: 'Modelo',
                description: 'Desarrollo del modelo',
                budget: '1500',
                roleId: 3,
                proficiencyId: 1,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (2 * 60 * 60 * 1000)),
                state: states.MilestoneState.SubmissionRejectedByClient,
                developerId: 2
            },
            {
                title: 'Controladores',
                description: 'Desarrollo de los controladores',
                budget: '2500',
                roleId: 3,
                proficiencyId: 3,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (4 * 60 * 60 * 1000)),
                state: states.MilestoneState.Completed,
                developerId: 2
            }
        ]
    },
    {
        title: 'SmarTerp',
        description: 'Servicio de Interpretes',
        summary: 'Proyecto de investigación para dessarrollar el MVP de un servicio blockchain',
        projectTypeId: 4,
        state: states.ProjectState.ProjectInProgress,
        url: 'https://kunveno.com',
        budgetId: 3,
        deliveryTimeId: 3,
        deliveryDate: new Date(new Date().getTime() + (5 * 60 * 60 * 1000)),
        clientId: 2,
        consultantId: 1,
        objectives: [
            "Desarrollar el back",
            "Desarrollar el front",
            "Validación de clientes"
        ],
        constraints: [],
        milestones: [
            {
                title: 'Todito',
                description: 'Sin tonterias intermedias',
                budget: '75000',
                roleId: 1,
                proficiencyId: 2,
                deliveryTimeId: 4,
                deliveryDate: new Date(new Date().getTime() + (5 * 60 * 60 * 1000)),
                state: states.MilestoneState.Completed,
                developerId: 2
            }
        ]
    }
];
