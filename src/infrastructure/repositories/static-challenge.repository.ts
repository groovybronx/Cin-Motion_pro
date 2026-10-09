import { DirectorChallengeEntity } from '../../domain/entities/director-challenge.entity.ts';
import { IChallengeRepository } from '../../domain/repositories/challenge.repository.interface.ts';

export class StaticChallengeRepository implements IChallengeRepository {
  private static readonly CHALLENGES: readonly DirectorChallengeEntity[] = [
    {
      id: 'mission-1',
      title: 'Mission 1 : La Prise de Conscience Tragique',
      scenarioContext: 'Le personnage découvre une lettre compromettante sur sa table de travail.',
      directorBrief:
        'Le réalisateur exige une montée d’intimité psychologique progressive sans modifier la focale optique. Réalisez un Travelling Avant (Dolly In) pour pénétrer dans les pensées intérieures du personnage.',
      targetMovementId: 'dolly-in',
      hint: 'Utilisez le bouton de lecture ou le curseur de timeline sur le Travelling Avant, ou approchez la caméra sur les rails.',
      successMessage:
        'Prise validée ! La parallaxe 3D resserre la tension dramatique avec une élégance hitchcockienne parfaite.',
    },
    {
      id: 'mission-2',
      title: 'Mission 2 : L’Apparition du Monolithe',
      scenarioContext: 'Le héros se retrouve au pied d’une mégapole futuriste titanesque.',
      directorBrief:
        'Pour retranscrire la démesure architecturale et le sentiment d’écrasement, effectuez un Panoramique Vertical (Tilt) ascendant pour découvrir le sommet du décor.',
      targetMovementId: 'tilt',
      hint: 'Sélectionnez le Panoramique Vertical (Tilt) ou inclinez manuellement l’angle de visée verticalement vers le haut.',
      successMessage:
        'Clap validé ! Le tilt ascendant fait ressentir la verticalité écrasante et l’impuissance de l’être humain.',
    },
    {
      id: 'mission-3',
      title: 'Mission 3 : Le Cauchemar du Vertige',
      scenarioContext: 'Une scène de révélation traumatisante où le sol semble se dérober sous les pieds de la victime.',
      directorBrief:
        'Générez une distorsion spatiale psychologique pure en maintenant le visage du sujet strictement à taille égale pendant que l’arrière-plan semble s’étirer à l’infini. Exécutez le Travelling Compensé (Dolly Zoom).',
      targetMovementId: 'dolly-zoom',
      hint: 'Choisissez le Travelling Compensé (Effet Vertigo / Dolly Zoom) dans la liste des mouvements.',
      successMessage:
        'Bravo, effet Vertigo magistral ! Le comédien est pétrifié dans le cadre pendant que l’espace se déforme.',
    },
    {
      id: 'mission-4',
      title: 'Mission 4 : L’Inquiétude et la Perte de Repères',
      scenarioContext: 'Le détective pénètre dans une demeure hantée par la folie et le complot.',
      directorBrief:
        'Bannissez la ligne d’horizon conventionnelle ! Inclinez la caméra sur son axe de roulis optique pour créer un Plan Débullé (Dutch Angle) traduisant l’instabilité mentale.',
      targetMovementId: 'roll-dutch',
      hint: 'Basculez sur le Plan Débullé / Dutch Angle ou ajustez le curseur d’inclinaison Roulis.',
      successMessage:
        'Excellent cadrage oblique ! L’horizon brisé instaure instantanément un sentiment de paranoïa expressionniste.',
    },
    {
      id: 'mission-5',
      title: 'Mission 5 : L’Élévation Céleste',
      scenarioContext: 'À la fin de la bataille, le regard doit s’échapper au-dessus du sol pour contempler l’ensemble de la tragédie.',
      directorBrief:
        'Élevez l’ensemble de la caméra verticalement dans les airs grâce au Travelling Vertical / Grue (Pedestal / Crane).',
      targetMovementId: 'boom-pedestal',
      hint: 'Sélectionnez le Travelling Vertical / Grue / Pedestal pour faire monter la machinerie dans l’espace.',
      successMessage:
        'Prise majestueuse ! La caméra prend de la hauteur et embrasse toute la dimension dramatique de la scène.',
    },
  ];

  public async getAllChallenges(): Promise<readonly DirectorChallengeEntity[]> {
    return StaticChallengeRepository.CHALLENGES;
  }

  public async getChallengeById(id: string): Promise<DirectorChallengeEntity | null> {
    const found = StaticChallengeRepository.CHALLENGES.find((c) => c.id === id);
    return found ?? null;
  }
}
