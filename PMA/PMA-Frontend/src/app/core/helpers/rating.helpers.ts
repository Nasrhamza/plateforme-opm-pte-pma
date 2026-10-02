export enum RatingTypes {
    Complexity = 'complexity',
    Duration = 'duration',
    Intensity = 'intensity',
    Urgency = 'urgency',
    Autonomy = 'autonomy',
};

export const labelTypes: LabelType[] = [
    {
        type: RatingTypes.Complexity,
        labels: [
            { level: 1, value: 'Very easy' },
            { level: 2, value: 'Easy' },
            { level: 3, value: 'Medium' },
            { level: 4, value: 'Complex' },
            { level: 5, value: 'Very complex' },
        ],
        },
        {
        type: RatingTypes.Duration,
        labels: [
            { level: 1, value: 'Very short' },
            { level: 2, value: 'Short' },
            { level: 3, value: 'Medium' },
            { level: 4, value: 'Long' },
            { level: 5, value: 'Very long' },
        ],
        },
        {
        type: RatingTypes.Intensity,
        labels: [
            { level: 1, value: 'Very low' },
            { level: 2, value: 'Low' },
            { level: 3, value: 'Medium' },
            { level: 4, value: 'High' },
            { level: 5, value: 'Major' },
        ],
        },
        {
        type: RatingTypes.Urgency,
        labels: [
            { level: 1, value: 'Not urgent at all' },
            { level: 2, value: 'Slightly urgent' },
            { level: 3, value: 'Moderately urgent' },
            { level: 4, value: 'Urgent' },
            { level: 5, value: 'Very urgent' },
        ],
        },
        {
        type: RatingTypes.Autonomy,
        labels: [
            { level: 1, value: 'Very low autonomy' },
            { level: 2, value: 'Low autonomy' },
            { level: 3, value: 'Moderate autonomy' },
            { level: 4, value: 'High autonomy' },
            { level: 5, value: 'Very high autonomy' },
        ],
        },
    ];
    
    
    export interface LabelType {
        type: string;
        labels: { level : number, value : string }[];
    }

export const questionsLabels : any = [
    { 
        evaluationType : 'taskScore', 
        labels : [
        { 
            question : 1, 
            values : ['Non-compliant', 'Compliant', 'Moderately compliant', 'Compliant', 'Very compliant'] 
        }, 
        { 
            question : 2, 
            values : ['Very significant delay', 'Partial delay', 'Acceptable delay', 'Little delay', 'No delay'] 
        }, 
        { 
            question : 3, 
            values : ['No communication', 'Insufficient communication', 'Moderate communication', 'Satisfactory communication', 'Excellent communication'] 
        }, 
        { 
            question : 4, 
            values : ['No autonomy', 'Limited autonomy', 'Moderate autonomy', 'Good autonomy', 'Excellent autonomy'] 
        }, 
        { 
            question : 5, 
            values : ['Non-exploitable', 'Weakly exploitable', 'Moderately exploitable', 'Exploitable', 'Completely exploitable'] 
        },       
        ],
    },
    { 
        evaluationType : 'managerNote', 
        labels : [
        { 
            question : 1, 
            values : ['Not satisfactory at all', 'Slightly satisfactory', 'Acceptable', 'Satisfactory', 'Very satisfactory']
        }, 
        { 
            question : 2, 
            values : ['Not satisfactory at all', 'Slightly satisfactory', 'Acceptable', 'Satisfactory', 'Very satisfactory'] 
        }, 
        { 
            question : 3, 
            values : ['Not satisfactory at all', 'Slightly satisfactory', 'Acceptable', 'Satisfactory', 'Very satisfactory'] 
        }, 
        { 
            question : 4, 
            values : ['Not satisfactory at all', 'Slightly satisfactory', 'Acceptable', 'Satisfactory', 'Very satisfactory'] 
        }, 
        { 
            question : 5, 
            values : ['Not satisfactory at all', 'Slightly satisfactory', 'Acceptable', 'Satisfactory', 'Very satisfactory'] 
        },       
        ],
    },
]
