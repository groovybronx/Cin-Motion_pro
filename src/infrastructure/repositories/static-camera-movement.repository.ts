import {
  CameraMovementEntity,
  MovementCategory,
  MovementId,
} from '../../domain/entities/camera-movement.entity.ts';
import { ICameraMovementRepository } from '../../domain/repositories/camera-movement.repository.interface.ts';

export class StaticCameraMovementRepository implements ICameraMovementRepository {
  private static readonly MOVEMENTS: readonly CameraMovementEntity[] = [
    {
      id: 'pan',
      frenchName: 'Panoramique Horizontal',
      originalName: 'Pan (Panning shot)',
      category: 'axis',
      shortDefinition:
        'Rotation de la caméra sur son axe vertical de gauche à droite ou de droite à gauche, le trépied restant immobile.',
      mechanicalAxis: 'Axe vertical (Lacet / Yaw) — Rotation pure sans translation physique',
      emotionalImpact:
        'Crée une sensation d’exploration naturelle, d’observation curieuse ou de tension lorsque le cadre révèle progressivement un danger hors-champ.',
      narrativeUsage:
        'Établir un décor (establishing shot), relier visuellement deux personnages distants dans une même prise sans coupure, ou accompagner le regard d’un protagoniste.',
      technicalExecution:
        'Exécuté sur un trépied équipé d’une tête fluide amortie. Le cadreur règle la friction pour assurer une vitesse constante et un freinage imperceptible.',
      keyDifferences:
        'À ne pas confondre avec le Travelling latéral : dans le panoramique, la caméra ne change pas de coordonnées dans l’espace, elle pivote sur elle-même.',
      iconicExamples: [
        {
          filmTitle: 'Fenêtre sur cour (Rear Window)',
          director: 'Alfred Hitchcock',
          year: 1954,
          sceneDescription: 'Balayage méticuleux des appartements de l’immeuble d’en face depuis l’appartement de Jeff.',
          emotionalReason: 'Matérialise le voyeurisme et fait du spectateur le complice du regard scrutateur du protagoniste.',
        },
        {
          filmTitle: 'Grand Budapest Hotel',
          director: 'Wes Anderson',
          year: 2014,
          sceneDescription: 'Panoramiques ultra-rapides (whip-pans) à 90 degrés rythmés par les dialogues théâtraux.',
          emotionalReason: 'Insuffle un rythme comique chirurgical et conserve la géométrie rigoureuse de la mise en scène.',
        },
      ],
      equipment: [
        {
          toolName: 'Trépied à tête fluide (Fluid Head)',
          roleDescription: 'Amortit les à-coups mécaniques et garantit une résistance hydraulique constante.',
          stabilityLevel: 'fixe',
        },
      ],
    },
    {
      id: 'tilt',
      frenchName: 'Panoramique Vertical',
      originalName: 'Tilt (Vertical Tilt)',
      category: 'axis',
      shortDefinition:
        'Inclinaison de la caméra vers le haut ou vers le bas sur son axe horizontal, sans déplacement du pied.',
      mechanicalAxis: 'Axe horizontal (Tangage / Pitch) — Rotation de bas en haut ou haut en bas',
      emotionalImpact:
        'Évoque la vulnérabilité face à l’immensité (tilt vers le haut) ou la domination, la chute morale et le vertige (tilt vers le bas).',
      narrativeUsage:
        'Révéler la taille imposante d’un édifice ou d’un titan, découvrir un personnage des pieds à la tête pour marquer son entrée, ou dévoiler un secret caché au sol.',
      technicalExecution:
        'Effectué avec contrepoids équilibré sur tête fluide pour éviter que le poids de l’objectif ne fasse basculer l’appareil par gravité.',
      keyDifferences:
        'Différent du Pedestal / Grue : le tilt change l’angle de visée en restant à la même hauteur, alors que la grue élève toute la caméra verticalement.',
      iconicExamples: [
        {
          filmTitle: 'Citizen Kane',
          director: 'Orson Welles',
          year: 1941,
          sceneDescription: 'Tilt ascendant majestueux le long du palais titanesque de Xanadu.',
          emotionalReason: 'Souligne la démesure et l’isolement tragique de la fortune de Kane.',
        },
        {
          filmTitle: 'Le Silence des Agneaux',
          director: 'Jonathan Demme',
          year: 1991,
          sceneDescription: 'Tilt descendant lors de la première apparition de Clarice dans les geôles vers la cellule du Dr Lecter.',
          emotionalReason: 'Plonge symboliquement dans les profondeurs de l’inconscient et de la folie criminelle.',
        },
      ],
      equipment: [
        {
          toolName: 'Tête fluide avec système de contrebalancement',
          roleDescription: 'Neutralise l’inertie verticale et maintient le cadrage à n’importe quel angle.',
          stabilityLevel: 'fixe',
        },
      ],
    },
    {
      id: 'dolly-in',
      frenchName: 'Travelling Avant',
      originalName: 'Dolly In (Push-In)',
      category: 'physical',
      shortDefinition:
        'Déplacement physique de la caméra vers l’avant dans l’espace scénique en direction du sujet.',
      mechanicalAxis: 'Axe Z de profondeur — Translation physique avant dans l’espace 3D',
      emotionalImpact:
        'Intensifie la connexion intime, signale une épiphanie, plonge dans les pensées intérieures ou crée une montée anxiogène irrésistible.',
      narrativeUsage:
        'Marquer la prise de décision cruciale d’un personnage, isoler une émotion clé ou resserrer l’attention dramatique à un tournant du scénario.',
      technicalExecution:
        'Caméra montée sur chariot (dolly) glissant sur des rails calibrés ou sur sol parfaitement lisse avec pneus pneumatiques. Un premier assistant opérateur (pointeur) suit la mise au point en continu.',
      keyDifferences:
        'Crucial : Contrairement au Zoom In, le Travelling Avant modifie la perspective tridimensionnelle réelle (effet de parallaxe entre l’avant-plan et l’arrière-plan).',
      iconicExamples: [
        {
          filmTitle: 'Le Parrain (The Godfather)',
          director: 'Francis Ford Coppola',
          year: 1972,
          sceneDescription: 'Travelling avant très lent et mesuré sur Michael Corleone au restaurant avant le double assassinat.',
          emotionalReason: 'Fait vivre au spectateur le passage irrémédiable de l’innocence civile au crime mafieux.',
        },
        {
          filmTitle: 'Inception',
          director: 'Christopher Nolan',
          year: 2010,
          sceneDescription: 'Push-in continu sur la toupie en rotation dans la scène finale.',
          emotionalReason: 'Condense toute la tension métaphysique sur un unique point focal.',
        },
      ],
      equipment: [
        {
          toolName: 'Chariot Dolly Chapman / Fisher',
          roleDescription: 'Chariot lourd monté sur rails d’acier garantissant une course d’une linéarité absolue.',
          stabilityLevel: 'sur-rail',
        },
        {
          toolName: 'Follow Focus sans fil',
          roleDescription: 'Commande motorisée pour ajuster le point millimètre par millimètre pendant l’avancée.',
          stabilityLevel: 'sur-rail',
        },
      ],
    },
    {
      id: 'dolly-out',
      frenchName: 'Travelling Arrière',
      originalName: 'Dolly Out (Pull-Out)',
      category: 'physical',
      shortDefinition:
        'Déplacement physique de la caméra s’éloignant du sujet dans l’espace scénique.',
      emotionalImpact:
        'Provoque une sensation de solitude, d’abandon, de mise en perspective de l’insignifiance humaine ou de conclusion contemplative.',
      mechanicalAxis: 'Axe Z de profondeur — Translation physique arrière dans l’espace 3D',
      narrativeUsage:
        'Élargir le contexte pour révéler l’immensité de l’environnement, signifier un départ définitif ou laisser un personnage seul avec son destin.',
      technicalExecution:
        'Exécuté sur rails ou grue mobile. L’équipe doit s’assurer que les rails et l’ombre de l’équipe ne pénètrent jamais dans le champ lors du recul.',
      keyDifferences:
        'Contrairement au dézoom optique, le travelling arrière fait défiler les objets d’avant-plan hors du champ avec une vraie dynamique spatiale.',
      iconicExamples: [
        {
          filmTitle: 'Taxi Driver',
          director: 'Martin Scorsese',
          year: 1976,
          sceneDescription: 'Recul de la caméra dans le couloir vide pendant que Travis est au téléphone.',
          emotionalReason: 'Traduit la gêne insupportable et la solitude totale du personnage que même la caméra refuse de regarder.',
        },
        {
          filmTitle: 'Barry Lyndon',
          director: 'Stanley Kubrick',
          year: 1975,
          sceneDescription: 'Reculs lents depuis un détail intime vers des paysages de peintures du XVIIIe siècle.',
          emotionalReason: 'Réinscrit le destin individuel dans la fresque immuable de l’Histoire.',
        },
      ],
      equipment: [
        {
          toolName: 'Rails de travelling droits ou courbes',
          roleDescription: 'Permettent une trajectoire rectiligne sans aucune secousse sur de longues distances.',
          stabilityLevel: 'sur-rail',
        },
      ],
    },
    {
      id: 'tracking-lateral',
      frenchName: 'Travelling Latéral / Suivi',
      originalName: 'Trucking Shot (Tracking shot)',
      category: 'physical',
      shortDefinition:
        'Déplacement physique latéral de la caméra parallèlement au sujet en mouvement.',
      mechanicalAxis: 'Axe X horizontal — Translation latérale gauche/droite parallèle au sujet',
      emotionalImpact:
        'Engendre un sentiment d’élan, d’énergie cinétique, de marche implacable ou d’accompagnement fraternel dans le périple du protagoniste.',
      narrativeUsage:
        'Rythmer une discussion en marche (walk-and-talk), suivre une charge militaire dans les tranchées ou traverser une succession de pièces de vie.',
      technicalExecution:
        'Rails parallèles à la ligne de marche ou utilisation d’un Steadicam / stabilisateur gyroscopique porté par un cadreur marchant à côté.',
      keyDifferences:
        'Le travelling latéral préserve la distance sujet-caméra constante tout en faisant défiler l’arrière-plan à grande vitesse (parallaxe maximale).',
      iconicExamples: [
        {
          filmTitle: 'Les Sentiers de la Gloire (Paths of Glory)',
          director: 'Stanley Kubrick',
          year: 1957,
          sceneDescription: 'Travelling continu en marche arrière et latérale dans les tranchées boueuses devant le colonel Dax.',
          emotionalReason: 'Immersion suffocante et magistrale dans la terreur de la guerre de tranchées.',
        },
        {
          filmTitle: 'Old Boy',
          director: 'Park Chan-wook',
          year: 2003,
          sceneDescription: 'Plan-séquence en travelling latéral dans le couloir lors du combat au marteau.',
          emotionalReason: 'Transforme le combat en fresque bidimensionnelle épuisante et brutale.',
        },
      ],
      equipment: [
        {
          toolName: 'Steadicam ou Ronin Gimbal',
          roleDescription: 'Système d’isolation des vibrations par bras à ressorts compensateurs.',
          stabilityLevel: 'stabilisé',
        },
      ],
    },
    {
      id: 'boom-pedestal',
      frenchName: 'Travelling Vertical / Grue / Pedestal',
      originalName: 'Pedestal / Crane / Jib Shot',
      category: 'physical',
      shortDefinition:
        'Élévation ou descente physique de l’ensemble de la caméra verticalement dans l’espace.',
      mechanicalAxis: 'Axe Y vertical — Translation en hauteur de bas en haut ou haut en bas',
      emotionalImpact:
        'Apporte une majesté olympienne, une sensation de liberté en apesanteur ou l’élévation spirituelle au-dessus du drame terrestre.',
      narrativeUsage:
        'Passer d’un détail intime au niveau du sol à une vision panoramique du champ de bataille, ou faire franchir à la caméra un obstacle architectural.',
      technicalExecution:
        'Bras de grue articulé (Technocrane) télescopique hydraulique contrôlé par un machiniste et une tête télécommandée 3 axes par joystick.',
      keyDifferences:
        'La caméra monte physiquement en hauteur, ce qui change les lignes de fuite et le point de vue en perspective, à la différence du simple Tilt.',
      iconicExamples: [
        {
          filmTitle: 'La La Land',
          director: 'Damien Chazelle',
          year: 2016,
          sceneDescription: 'Montée vertigineuse de la grue au-dessus de l’autoroute pendant le numéro d’ouverture.',
          emotionalReason: 'Transmet une joie chorégraphique expansive et transcende la réalité morose du trafic routier.',
        },
        {
          filmTitle: 'Autant en emporte le vent',
          director: 'Victor Fleming',
          year: 1939,
          sceneDescription: 'Recul et élévation monumentale de la grue dévoilant des milliers de blessés confédérés sur la place d’Atlanta.',
          emotionalReason: 'Choc esthétique et tragique faisant mesurer l’ampleur du carnage.',
        },
      ],
      equipment: [
        {
          toolName: 'Grue télescopique Technocrane',
          roleDescription: 'Bras télescopique extensible jusqu’à 15 mètres avec tête tourelle gyro-stabilisée.',
          stabilityLevel: 'grue',
        },
      ],
    },
    {
      id: 'zoom-in',
      frenchName: 'Zoom Optique (Travelling optique)',
      originalName: 'Optical Zoom (Crash Zoom / Slow Zoom)',
      category: 'optical',
      shortDefinition:
        'Changement progressif de la distance focale de l’objectif (de grand-angle vers téléobjectif) sans déplacement physique de la caméra.',
      mechanicalAxis: 'Aucun axe physique — Modification optique interne du groupe de lentilles',
      emotionalImpact:
        'Provoque une soudaine surprise brutale (Crash Zoom) ou une observation clinique voyeuriste et détachée.',
      narrativeUsage:
        'Révéler un détail capital sans couper au montage, styliser un hommage aux westerns spaghetti ou simuler un regard aux jumelles.',
      technicalExecution:
        'Actionné par une commande de zoom électrique (moteur Preston) pour garantir une vitesse de grossissement ultra-régulière.',
      keyDifferences:
        'Contrairement au travelling physique, le zoom comprime les plans : l’arrière-plan semble s’écraser sur le sujet et la perspective spatiale ne change pas.',
      iconicExamples: [
        {
          filmTitle: 'Django Unchained',
          director: 'Quentin Tarantino',
          year: 2012,
          sceneDescription: 'Crash-zooms instantanés et percutants sur les visages lors des duels.',
          emotionalReason: 'Hommage stylisé aux codes du western spaghetti et ponctuation dynamique éclatante.',
        },
        {
          filmTitle: 'The Shining',
          director: 'Stanley Kubrick',
          year: 1980,
          sceneDescription: 'Zooms lents et inexorables sur Jack Torrance absorbé par sa machine à écrire.',
          emotionalReason: 'Crée une tension glaciale et une sensation de piège mental.',
        },
      ],
      equipment: [
        {
          toolName: 'Objectif Zoom Cinéma (ex: Angénieux Optimo)',
          roleDescription: 'Focale variable à ouverture constante et compensation chromatique haute fidélité.',
          stabilityLevel: 'fixe',
        },
      ],
    },
    {
      id: 'dolly-zoom',
      frenchName: 'Travelling Compensé (Effet Vertigo)',
      originalName: 'Dolly Zoom (Vertigo Effect / Zolly)',
      category: 'optical',
      shortDefinition:
        'Combinaison simultanée d’un travelling physique et d’un zoom optique en sens opposé, maintenant le sujet à taille constante.',
      mechanicalAxis: 'Combinaison synchronisée Translation Z + Modification focale inverse',
      emotionalImpact:
        'Génère une sensation de vertige physique, d’effroi psychologique soudain, de désorientation spatiale ou de choc traumatique.',
      narrativeUsage:
        'Matérialiser le vertige phobique, le moment précis où un personnage réalise une vérité monstrueuse ou vit une montée de panique.',
      technicalExecution:
        'Prouesse de coordination : le machiniste recule le chariot à une vitesse exactement calée sur le zooming avant du pointeur (ou inversement), nécessitant des repères millimétrés.',
      keyDifferences:
        'Le sujet principal reste rigoureusement immobile dans le cadre, tandis que tout le décor autour de lui semble s’étirer, se gonfler ou se comprimer.',
      iconicExamples: [
        {
          filmTitle: 'Sueurs froides (Vertigo)',
          director: 'Alfred Hitchcock',
          year: 1958,
          sceneDescription: 'Vue plongeante dans la cage d’escalier de la tour de la mission.',
          emotionalReason: 'Invention historique de l’effet pour figurer l’acrophobie paralysante de Scottie.',
        },
        {
          filmTitle: 'Les Dents de la Mer (Jaws)',
          director: 'Steven Spielberg',
          year: 1975,
          sceneDescription: 'Travelling compensé sur le chef Brody assis sur la plage lorsqu’il aperçoit l’attaque du requin.',
          emotionalReason: 'Matérialise l’effroi glacé et la culpabilité instantanée du protagoniste.',
        },
      ],
      equipment: [
        {
          toolName: 'Chariot Dolly couplé à un servo-moteur de zoom asservi',
          roleDescription: 'Permet une synchronisation milliseconde entre la vitesse de roulage et le moteur optique.',
          stabilityLevel: 'sur-rail',
        },
      ],
    },
    {
      id: 'roll-dutch',
      frenchName: 'Plan Débullé / Roulis / Dutch Angle',
      originalName: 'Dutch Angle (Cant / Roll)',
      category: 'axis',
      shortDefinition:
        'Inclinaison latérale délibérée de la caméra sur son axe optique, brisant la ligne d’horizon horizontale.',
      mechanicalAxis: 'Axe longitudinal (Roulis / Roll) — Pivot autour de l’axe optique Z',
      emotionalImpact:
        'Crée un malaise immédiat, une sensation de folie, de cauchemar éveillé, de danger imminent ou de perte de repères moraux.',
      narrativeUsage:
        'Scènes de complot, crises d’hallucination, affrontements psychologiques ou esthétique expressionniste et bande dessinée.',
      technicalExecution:
        'Tête hollandaise (Dutch Head) montée sur la tête fluide, permettant une rotation continue et un verrouillage angulaire oblique.',
      keyDifferences:
        'Rompt volontairement la convention de la ligne d’horizon plane pour déséquilibrer la composition visuelle.',
      iconicExamples: [
        {
          filmTitle: 'Le Troisième Homme (The Third Man)',
          director: 'Carol Reed',
          year: 1949,
          sceneDescription: 'Ruelles nocturnes viennoises filmées avec des angles débullés permanents.',
          emotionalReason: 'Exprime la corruption morale et la paranoïa de l’après-guerre.',
        },
        {
          filmTitle: 'Do The Right Thing',
          director: 'Spike Lee',
          year: 1989,
          sceneDescription: 'Confrontations verbales en plans obliques serrés dans la pizzeria de Sal.',
          emotionalReason: 'Fait monter l’insoutenable tension raciale et la chaleur étouffante de la rue.',
        },
      ],
      equipment: [
        {
          toolName: 'Tête hollandaise (Dutch Head)',
          roleDescription: 'Berceau mécanique additionnel permettant d’incliner la caméra jusqu’à 90 degrés sur le côté.',
          stabilityLevel: 'fixe',
        },
      ],
    },
    {
      id: 'orbit-360',
      frenchName: 'Mouvement Orbital / 360°',
      originalName: 'Orbit Shot (360 Degree Tracking)',
      category: 'physical',
      shortDefinition:
        'Trajectoire circulaire continue de la caméra autour du sujet qui reste le centre de gravité immuable du plan.',
      mechanicalAxis: 'Trajectoire circulaire curviligne autour d’un barycentre fixe',
      emotionalImpact:
        'Confère une aura héroïque mythologique, une sensation de vertige amoureux ou de suspension du temps.',
      narrativeUsage:
        'Le baiser passionné de deux amants, le moment où une équipe de héros se regroupe avant la bataille ultime, ou le doute métaphysique.',
      technicalExecution:
        'Rails circulaires courbés fermés à 360° ou opérateur Steadicam tournant en cercle parfait avec repères de pas au sol.',
      keyDifferences:
        'La caméra tourne continuellement autour du sujet, offrant une exploration complète du décor tout en maintenant le personnage ancré au centre.',
      iconicExamples: [
        {
          filmTitle: 'Matrix',
          director: 'Lana et Lilly Wachowski',
          year: 1999,
          sceneDescription: 'Mouvement circulaire autour de Trinity sautant en l’air (bullet time).',
          emotionalReason: 'Révolution esthétique suspendant la physique du temps et de l’espace.',
        },
        {
          filmTitle: 'Avengers',
          director: 'Joss Whedon',
          year: 2012,
          sceneDescription: 'Plan circulaire légendaire reliant les six super-héros prêts au combat dans les rues de New York.',
          emotionalReason: 'Scelle l’unité du groupe et crée le climax fédérateur de la saga.',
        },
      ],
      equipment: [
        {
          toolName: 'Rails de travelling circulaires ou Rig rigide à bras rotatif',
          roleDescription: 'Guides courbes assurant un rayon de rotation parfaitement constant au millimètre.',
          stabilityLevel: 'sur-rail',
        },
      ],
    },
    {
      id: 'handheld',
      frenchName: 'Caméra Portée / Épaule',
      originalName: 'Handheld Camera (Shaky Cam)',
      category: 'organic',
      shortDefinition:
        'Prise de vue sans trépied ni stabilisation artificielle, la caméra reposant sur l’épaule ou tenue à bout de bras.',
      mechanicalAxis: '6 degrés de liberté libres et instables — Micro-oscillations humaines naturelles',
      emotionalImpact:
        'Crée une sensation d’urgence viscérale, de réalisme brut documentaire, de chaos immersif et de danger immédiat.',
      narrativeUsage:
        'Séquences de guerre, poursuites frénétiques au corps à corps, scènes intimistes prises sur le vif ou cinéma vérité.',
      technicalExecution:
        'L’opérateur utilise un harnais de délestage (Easyrig) pour soutenir les 12 kg de la caméra cinéma tout en conservant les micro-mouvements organiques.',
      keyDifferences:
        'Rejette délibérément la perfection mécanique du travelling pour conférer la signature corporelle et respiratoire du cadreur.',
      iconicExamples: [
        {
          filmTitle: 'Il faut sauver le soldat Ryan',
          director: 'Steven Spielberg',
          year: 1998,
          sceneDescription: 'Débarquement d’Omaha Beach au ras de l’eau et des balles avec obturateur à 45 degrés.',
          emotionalReason: 'Fait vivre la panique et la violence physique du combat sans filtre protecteur.',
        },
        {
          filmTitle: 'La Vengeance dans la Peau (The Bourne Ultimatum)',
          director: 'Paul Greengrass',
          year: 2007,
          sceneDescription: 'Poursuite à pied et corps-à-corps dans les toits de Tanger.',
          emotionalReason: 'Accroît l’adrénaline et la sensation d’improvisation tactique ultra-rapide.',
        },
      ],
      equipment: [
        {
          toolName: 'Harnais Easyrig Vario 5',
          roleDescription: 'Transfère le poids de la caméra sur les hanches tout en laissant les mouvements d’épaule naturels.',
          stabilityLevel: 'porté',
        },
      ],
    },
  ];

  public async getAllMovements(): Promise<readonly CameraMovementEntity[]> {
    return StaticCameraMovementRepository.MOVEMENTS;
  }

  public async getMovementById(id: MovementId): Promise<CameraMovementEntity | null> {
    const found = StaticCameraMovementRepository.MOVEMENTS.find((m) => m.id === id);
    return found ?? null;
  }

  public async getMovementsByCategory(category: MovementCategory): Promise<readonly CameraMovementEntity[]> {
    return StaticCameraMovementRepository.MOVEMENTS.filter((m) => m.category === category);
  }
}
