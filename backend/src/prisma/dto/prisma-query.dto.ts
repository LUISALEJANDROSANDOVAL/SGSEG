export class PrismaQueryDto {
  take?: number;
  skip?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
}
