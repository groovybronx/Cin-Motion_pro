import { GlossaryTermEntity } from '../../domain/entities/glossary-term.entity.ts';
import { IGlossaryRepository } from '../../domain/repositories/glossary.repository.interface.ts';

export class StaticGlossaryRepository implements IGlossaryRepository {
  private static readonly TERMS: readonly GlossaryTermEntity[] = [
    {
      key: 'parallaxe',
      term: 'Parallaxe',
      category: 'cadrage',
      definition:
        'Changement de position apparente d’un objet par rapport à son arrière-plan lorsque la caméra se déplace physiquement dans l’espace 3D. Plus un objet est proche de l’objectif, plus il défile vite à l’écran.',
      concreteExample:
        'Dans un travelling latéral le long d’une rue, les réverbères au premier plan défilent à toute allure, tandis que les gratte-ciels lointains semblent presque immobiles.',
      technicalTip:
        'C’est la signature absolue d’un vrai mouvement de travelling physique. Un zoom optique ne produit AUCUNE parallaxe car la caméra ne bouge pas de coordonnées.',
    },
    {
      key: 'focale',
      term: 'Distance Focale',
      category: 'optique',
      definition:
        'Mesure en millimètres (ex: 24mm, 50mm, 85mm) de la distance entre le centre optique de l’objectif et le capteur. Elle détermine l’angle de champ et la perspective de l’image.',
      concreteExample:
        'Une courte focale (24mm, grand-angle) élargit le champ et étire l’espace. Une longue focale (85mm+, téléobjectif) resserre le cadrage et aplatit les plans.',
      technicalTip:
        'La focale 50mm sur capteur plein format est considérée comme la plus proche de la vision naturelle de l’œil humain.',
    },
    {
      key: 'profondeur-de-champ',
      term: 'Profondeur de Champ (DoF)',
      category: 'optique',
      definition:
        'Zone de netteté s’étendant en avant et en arrière du point précis sur lequel la mise au point est faite. Une faible profondeur de champ isole le sujet en floutant l’arrière-plan (effet bokeh).',
      concreteExample:
        'Dans Le Fabuleux Destin d’Amélie Poulain, les gros plans utilisent une très faible profondeur de champ pour isoler les expressions du visage.',
      technicalTip:
        'Elle dépend de trois paramètres : l’ouverture du diaphragme (f/1.4 = très faible), la focale (plus longue = plus faible) et la distance au sujet.',
    },
    {
      key: 'dolly',
      term: 'Dolly (Chariot de Travelling)',
      category: 'machinerie',
      definition:
        'Plateforme roulante robuste montée sur pneumatiques ou rails d’acier calibrés, transportant la caméra et son cadreur pour des mouvements d’une fluidité absolue.',
      concreteExample:
        'Le célèbre travelling avant sur le visage de Roy Scheider dans Les Dents de la Mer (Jaws) est réalisé avec un chariot Dolly combiné à un zoom.',
      technicalTip:
        'Nécessite souvent l’intervention d’un chef machiniste qui pousse le chariot au millimètre et d’un premier assistant opérateur (pointeur).',
    },
    {
      key: 'steadicam',
      term: 'Steadicam',
      category: 'machinerie',
      definition:
        'Système mécanique inventé par Garrett Brown en 1975 composé d’une veste harnais, d’un bras articulé à ressorts amortisseurs et d’un contrepoids rotatif isolant les mouvements de marche.',
      concreteExample:
        'Les mythiques poursuites en tricycle de Danny dans les couloirs de l’hôtel Overlook dans The Shining de Stanley Kubrick.',
      technicalTip:
        'Permet de monter des escaliers, courir ou traverser des portes sans poser de rails de travelling au sol.',
    },
    {
      key: 'tete-fluide',
      term: 'Tête Fluide Hydraulique',
      category: 'machinerie',
      definition:
        'Partie supérieure d’un trépied cinéma contenant des chambres d’huile silicone à friction réglable permettant d’exécuter des panoramiques sans saccades ni rebonds à l’arrêt.',
      concreteExample:
        'Tous les plans panoramiques de Wes Anderson sont cadencés grâce à des têtes fluides de précision micrométrique (comme OConnor ou Sachtler).',
      technicalTip:
        'Le contrebalancement doit être ajusté avec précision selon le centre de gravité de la caméra équipée.',
    },
    {
      key: 'crash-zoom',
      term: 'Crash Zoom (Snap Zoom)',
      category: 'optique',
      definition:
        'Zoom avant ou arrière ultra-rapide et brutal vers un sujet, utilisé pour créer un effet comique, d’urgence dramatique ou d’hommage aux films de genre.',
      concreteExample:
        'La signature visuelle de Quentin Tarantino dans Kill Bill et Django Unchained lors des confrontations de duellistes.',
      technicalTip:
        'Réalisé manuellement avec un levier de zoom (zoom stick) actionné sèchement par le cadreur plutôt qu’avec un moteur électrique.',
    },
    {
      key: 'dutch-angle',
      term: 'Plan Débullé (Dutch Angle / Cant)',
      category: 'cadrage',
      definition:
        'Cadrage oblique où la ligne d’horizon est volontairement inclinée par rapport aux bords de l’écran en faisant pivoter la caméra sur son axe optique (roulis).',
      concreteExample:
        'Carol Reed l’utilise systématiquement dans Le Troisième Homme (1949) pour symboliser la décadence morale de Vienne.',
      technicalTip:
        'Utilisez avec modération : un angle de 15° à 25° suffit à instaurer une atmosphère d’angoisse ou de démence.',
    },
    {
      key: 'technocrane',
      term: 'Technocrane / Grue Télescopique',
      category: 'machinerie',
      definition:
        'Grue articulée motorisée dont le bras peut s’étendre ou se rétracter de manière télescopique jusqu’à plus de 15 mètres pendant la prise de vue, sans bruit.',
      concreteExample:
        'Le plan d’ouverture aérien au-dessus de l’autoroute dans La La Land de Damien Chazelle.',
      technicalTip:
        'La tête de caméra gyrostabilisée est pilotée à distance depuis une console de commande par un cadreur indépendant.',
    },
    {
      key: 'regle-180',
      term: 'Règle des 180 Degrés',
      category: 'mise-en-scene',
      definition:
        'Principe fondamental de mise en scène : une ligne d’axe imaginaire relie les protagonistes. La caméra ne doit pas franchir cette ligne pour préserver la cohérence des regards gauche/droite.',
      concreteExample:
        'Dans tout dialogue de champ / contre-champ classique, le personnage de gauche regarde toujours vers la droite de l’écran et vice-versa.',
      technicalTip:
        'Franchir la ligne (jump the line) crée un faux raccord violent, parfois utilisé délibérément pour symboliser une inversion de rapport de force.',
    },
    {
      key: 'frustum',
      term: 'Cône de Frustum (Angle de Champ)',
      category: 'optique',
      definition:
        'Volume géométrique pyramidal représentant tout l’espace visible par l’objectif de la caméra. Ce volume s’évase avec un objectif grand-angle et se rétrécit avec un téléobjectif.',
      concreteExample:
        'Sur le plateau de tournage, le cône de lumière simulé en régie montre exactement ce qui rentre dans le cadre et ce qui reste hors-champ.',
      technicalTip:
        'Un téléobjectif 135mm a un angle de champ d’environ 18°, tandis qu’un 24mm couvre plus de 84° d’angle horizontal.',
    },
    {
      key: 'obturateur-180',
      term: 'Règle de l’Obturateur à 180°',
      category: 'optique',
      definition:
        'Règle cinématique selon laquelle le temps d’exposition de chaque photogramme est égal à la moitié de la cadence d’images (ex: à 24 fps, shutter = 1/48 seconde).',
      concreteExample:
        'Donne au mouvement cinématographique son flou esthétique naturel (motion blur), ni trop net ni trop flou.',
      technicalTip:
        'Un angle plus faible (ex: 45° à 1/192s, comme dans Il faut sauver le soldat Ryan) produit un effet stroboscopique hyper-nerveux lors des explosions.',
    },
    {
      key: 'easyrig',
      term: 'Easyrig (Harnais de Soulagement)',
      category: 'machinerie',
      definition:
        'Système dorsal composé d’une potence supérieure et d’une ligne de suspension à câble élastique qui transfère le poids de la caméra (souvent 8 à 15 kg) sur les hanches du cadreur.',
      concreteExample:
        'Omniprésent sur les tournages caméra à l’épaule de documentaires et de films d’action contemporains (cinéma des frères Dardenne, Paul Greengrass).',
      technicalTip:
        'Préserve le dos du technicien tout en conservant les micro-oscillations corporelles indispensables à la caméra portée.',
    },
  ];

  public async getAllTerms(): Promise<readonly GlossaryTermEntity[]> {
    return StaticGlossaryRepository.TERMS;
  }

  public async getTermByKey(key: string): Promise<GlossaryTermEntity | null> {
    const found = StaticGlossaryRepository.TERMS.find((t) => t.key.toLowerCase() === key.toLowerCase());
    return found ?? null;
  }

  public async searchTerms(query: string): Promise<readonly GlossaryTermEntity[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return StaticGlossaryRepository.TERMS;
    return StaticGlossaryRepository.TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(cleanQuery) ||
        t.definition.toLowerCase().includes(cleanQuery) ||
        t.concreteExample.toLowerCase().includes(cleanQuery)
    );
  }
}
