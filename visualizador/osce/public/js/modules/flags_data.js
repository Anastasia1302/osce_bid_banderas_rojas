const flagData = {
    "bandera_1": {
        "nombre": "1",
        "descripcion": "Número de versiones en el PAC es demasiado alto.",
        "metodologia": "En un periodo de tiempo dado (enero-febrero 2020), se mira el 'Número de versiones en el PAC'. Se identifica la pertinencia del ente convocante a uno de los 5 grupos, de acuerdo con lo presupuestado. Se computa la media y el desvío estándar (SD) dentro de cada grupo. Finalmente, se levanta la bandera para las convocatorias en las que el 'Número de versiones en el PAC' es superior a la media + 2SDs dentro de cada grupo.",
        "etapa": "Planificación"
    },
    "bandera_2": {
        "nombre": "2",
        "descripcion": "El proceso realizado por un ente que tiene alta proporción de contratación directa.",
        "metodologia": "Para un periodo de tiempo dado (12 meses), para un itemcubso listado en la convocatoria, para todos los entes, contar el número total de convocatorias y el número de convocatorias con contratación directa. Se encuentra la media, la desviación estándar(SD) de la proporción de contratación directa (#directa/#todos) para cada uno de los entes y para el total de los entes. Se levanta la bandera si al menos para un itemcubso, este ente tiene la proporción de contratación directa superior a la media. No se considera los itemcubso para los casos donde la proporción de contratación directa para todos los entes es superior a 90% (mercados no competitivos).",
        "etapa": "Convocatoria"
    },
    "bandera_8": {
        "nombre": "8",
        "descripcion": "Se ha adjudicado 'Buena pro', a pesar de que antes hubo denuncia o dictamen donde se indica que se declare la nulidad del procedimiento.",
        "metodologia": "Se conecta con la tabla de Adjudicaciones y se verifica que el estado del ítem sea: Consentido, Apelado, Contratado, Adjudicado. Se verifica si la convocatoria está en la pestaña 'ASO2021' o 'DICT2021' de la tabla DGR. De ser así, se verifica que en el caso de ASO, se indica 'Nulidad' en la columna 'Disposición'. En el caso de DICT, la conclusión final es 'Fundado'. De ser así, se mira la 'Fecha Oficio (ASO)' y la 'Fecha Emisión del Dictamen (DICT)'. Si esta fecha es anterior a la 'Fecha de Consentimiento de Buena pro', se levanta la bandera.",
        "etapa": "Presentación de propuestas"
    },
    "bandera_21": {
        "nombre": "21",
        "descripcion": "Adjudicación con el tipo de proceso de selección diferente al planificado.",
        "metodologia": "Se verifica si el tipo de proceso de selección indicado en 'Adjudicaciones' es el mismo que en el PAC. De no ser así, se levanta la bandera.",
        "etapa": "Adjudicación"
    },
    "bandera_3": {
        "nombre": "3",
        "descripcion": "El número de días entre 'Fecha de Convocatoria' y la 'Fecha de Presentación de Propuestas', es inferior al marcado en legislación.",
        "metodologia": "Se computa el número de días transcurridos entre la 'Fecha de Convocatoria' y la 'Fecha de presentación de propuestas'. Este número de días es inferior a:  </br></br>-  Licitación y Concurso público: 22 días </br>-  Contratación directa: NO APLICA </br>-  Consultoría individual: 5 días </br>-  Adjudicación simplificada: 3 días </br>-  Subasta inversa electrónica: NO APLICA  o 5 días? </br>-  Comparación de precios: NO APLICA </br></br>Si no se puede construir la bandera, el estado es NO APLICA.",
        "etapa": "Convocatoria"
    },
    "bandera_3a": {
        "nombre": "3a",
        "descripcion": "El tiempo transcurrido entre 'Fecha de convocatoria' y la 'Fecha de Presentación de Propuestas', es demasiado largo",
        "metodologia": "Para un periodo de tiempo dado (12 meses), se computa el número de días transcurridos entre la 'Fecha de convocatoria' y la 'Fecha de presentación de propuestas'. Por cada tipo de proceso de selección, se computa la media y la desviación estándar (SD). Si el tiempo es superior a la media + 2SD, se levanta la bandera. ",
        "etapa": "Convocatoria"
    },
    "bandera_17": {
        "nombre": "17",
        "descripcion": "El tiempo transcurrido entre la 'Fecha Buena pro' y la 'Fecha de Consentimiento Buena pro', es inferior al límite marcado por la legislación",
        "metodologia": "Se excluye la contratación directa. Solo para procedimientos en los que hay más de 1 postor, se computa el tiempo transcurrido en días entre la 'Fecha Buena pro' y la 'Fecha Consentimiento de Buena pro'. Se levanta la bandera si el número de días es inferior a: </br></br>-  Concurso público/Licitación pública: 8+1 días. </br>-  Consultoría individual: 5+1 días. </br>-  Adjudicación simplificada: 5+1 días. </br>-  Subasta inversa electrónica: 5+1 días. </br>-  Comparación de precios: 5+1 días.",
        "etapa": "Adjudicación"
    },
    "bandera_22": {
        "nombre": "22",
        "descripcion": "El plazo transcurrido entre la 'Fecha Consentimiento de Buena pro' y la 'Fecha Suscripción del contrato', es demasiado largo.",
        "metodologia": "Se computa el tiempo transcurrido en días entre la 'Fecha Consentimiento de Buena pro y la 'Fecha de Suscripción del Contrato'. Se levanta la bandera si el número de días es superior a 16 días. Se aplica a todos procesos de selección excluyendo 'Contratación directa'. </br></br>En la ficha de bandera, se indica que la fecha relevantes es: 'Fecha de publicación del Consentimiento de Buena pro'. </br></br>Por ejemplo, si la 'Fecha Consentimiento de Buena pro es el día 1 de noviembre, se levanta la bandera si la suscripción del contrato es el día 17 o más tarde.",
        "etapa": "Contrato"
    },
    "bandera_4": {
        "nombre": "4",
        "descripcion": "No se dispone de la información sobre el postor (la convocatoria no cuenta con postores) en una convocatoria adjudicada.",
        "metodologia": "Se hace el cruce entre las tablas: Convocatoria, Adjudicación y Postor. Se verifica que el número de la convocatoria adjudicada no está en la tabla Postor.",
        "etapa": "Presentación de propuestas"
    },
    "bandera_4a": {
        "nombre": "4a",
        "descripcion": "El número de participantes es sustancialmente mayor que el número de postores.",
        "metodologia": "Se hace el cruce entre las tablas: Convocatoria, Participantes y Postor. Por tipo de proceso de selección, se computa la proporción de postores por participantes; es decir, se computa el ratio (#postores/#participantes). </br></br>Para cada tipo de procedimiento, en un periodo de tiempo dado (12 meses), se computa la media y la desviación estándar (SD). </br></br>Si se observa que, en una convocatoria dada, la proporción es inferior a la media menos 2SD, se levanta la bandera. </br></br>Por ejemplo, si en promedio 10% de participantes acaban siendo postores, se levanta la bandera para un proceso en el cual esta proporción es inferior a 1% (10% - 2*10%*90% = 1%).",
        "etapa": "Presentación de propuestas"
    },
    "bandera_5": {
        "nombre": "5",
        "descripcion": "Se ha hecho contratación directa con un postor que nunca antes había tenido contrato como proveedor del sector público.",
        "metodologia": "Solo para la contratación directa, para cada contrato, buscamos RUCs de los postores (en la tabla de adjudicaciones) en contratos previos a la fecha de esta convocatoria. Si no se encuentra, se levanta la bandera. Se mira desde enero 2018 hasta la fecha del registro de la propuesta del postor.",
        "etapa": "Presentación de propuestas"
    },
    "bandera_5a": {
        "nombre": "5a",
        "descripcion": "Se presenta un postor que nunca había ganado en un proceso de compras públicas para este grupo de ítems.",
        "metodologia": "Para cada postor, se anota el grupo de ítem que corresponda,  buscamos el RUC de postor en la tabla Adjudicaciones, previos a la fecha de esta convocatoria. Si no hay contrato para este mismo grupo, se levanta la bandera. Se mira desde enero 2018 hasta la fecha del registro de la propuesta del postor.",
        "etapa": "Presentación de propuestas"
    },
    "bandera_13": {
        "nombre": "13",
        "descripcion": "Se ha hecho la adjudicación a un ganador no habido no hallado.",
        "metodologia": "Para cada adjudicación, se mira el RUC_CODIGO_GANADOR. Se verifica si el ganador se encuentra en la tabla facilitada por SUNAT, y si se encuentra allí, se levanta la bandera si su estado es no habido o no hallado. Para ganadores no encontrados en la base SUNAT se propone mostrar  el estado 'No aplica' (NaN).",
        "etapa": "Presentación de propuestas"
    },
    "bandera_16": {
        "nombre": "16",
        "descripcion": "A una convocatoria se presentó un postor que consistentemente gana contratos con este ente convocante.",
        "metodologia": "Se identifica la combinación ente-postor-familia. Para cada combinación, en un periodo de tiempo dado (2018-2020), se cuenta el número total de convocatorias (a las que postor postuló), se cuenta el número total de contratos (en los que el postor ganó). Se computa el (#contratos donde ganó)/(#convocatorias donde postuló). </br></br>Se levanta la bandera en el proceso si, al menos para una combinación postor-ente-familia, #contratos/#convocatorias > 90%. Se considera que la bandera no aplica si el ratio # contratos ganados / # convocatorias donde postuló es igual a 1/1.",
        "etapa": "Presentación de propuestas"
    },
    "bandera15": {
        "nombre": "15",
        "descripcion": "El monto del postor es demasiado cercano al monto referencial.",
        "metodologia": "Solo para bienes y servicios, para cada convocatoria, se verifica el 'monto referencial ítem' de items cuyo estado es 'Contratado', 'Convocado', 'Consentido', 'Adjudicado', se identifican los postores y se seleccionan solo las convocatorias con un único postor. Se analiza el monto propuesto por el postor en la tabla 'Postor'. Si para al menos un item de la convocatoria, el monto del postor es +/- 5% del monto referencial, la bandera toma valor 'Si'. </br></br>En casos de 'consultoría de obra' y 'obra' o procesos de 'contratación directa' la bandera toma valor 'No aplica'.",
        "etapa": "Presentación de propuestas"
    },
    "bandera19": {
        "nombre": "19",
        "descripcion": "El monto adjudicado por unidad (precio unitario), es superior al valor histórico.",
        "metodologia": "Solo para bienes, para cada adjudicación, para cada itemcubso (no usamos familia) y tipo de procedimiento. En un periodo de tiempo dado (últimos 2 meses), se computa el promedio y la desviación estándar (SD) del monto por ítem. Se levanta la bandera en la adjudicación si, al menos para un itemcubso el monto adjudicado es superior a la media + 2SD. En la ficha de bandera, se muestra los códigos de procedimientos en los que se adquirió este mismo itemcubso.",
        "etapa": "Adjudicación"
    },
    "bandera_23a": {
        "nombre": "23a",
        "descripcion": "Hubo modificaciones en el monto contratado, es muy cercano al límite permitido.",
        "metodologia": "Para cada 'monto_contratado_item', se computa: </br></br>monto_adicional / monto_contratado_item </br>monto_reducción / monto_contratado_item </br>monto_complementario / monto_contratado_item. </br></br>Solo para bienes y servicios: Se levanta la bandera si el ratio esta entre: </br></br>(i) 23% y 25%, inclusive, para todos procesos de selección. </br>(ii) 23% y 25%, inclusive, para todos procesos de selección. </br>(iii) 23% y 25%, inclusive, excluir contratación directa. </br></br>Para obras, para todos procesos de selección: </br>Se levanta la bandera si el ratio esta entre: </br></br>(i) 47%-50%, inclusive. </br>(ii) 47%-50%, inclusive. </br>(iii) 47%-50%, inclusive. </br></br>No se considera supervisión de obras (no hay límite establecido).",
        "etapa": "Ejecución"
    },
    "bandera_27": {
        "nombre": "27",
        "descripcion": "El monto con el cual el proveedor ganador postuló, es menor al monto contratado.",
        "metodologia": "Para cada contrato, para cada proveedor, se mira el MONTO_CONTRATADO_ITEM y se compara este valor con el MONTO en la tabla Postor. Si el MONTO en la tabla Postor es inferior al MONTO_CONTRATADO_ITEM  para este proveedor, se levanta la bandera. ",
        "etapa": "Contrato"
    },
    "bandera_29": {
        "nombre": "29",
        "descripcion": "La diferencia entre el monto de referencia en convocatoria y monto contratado, es excesivo.",
        "metodologia": "Solo para bienes y servicios, para cada contrato, para cada ítem, se compara el MONTO_CONTRATADO_ITEM en la tabla Contratos y el MONTO_REFERENCIAL_ITEM en la tabla Convocatoria. Se levanta la bandera si el MONTO_CONTRATADO_ITEM es 30% mayor que el MONTO_REFERENCIAL_ITEM (umbral BM).",
        "etapa": "Contrato"
    }
}

export default flagData;