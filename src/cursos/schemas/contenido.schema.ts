import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contenido extends Document {
  @Prop({ required: false })
  titulo?: string;

  @Prop({ required: false })
  duracion?: number;

  @Prop({ required: false })
  descripcion?: string;

  @Prop({ required: true })
  tipo?: string;

  @Prop({ required: true })
  enlace?: string;

  @Prop({ required: false })
  dificultad?: string;

  @Prop({ required: false })
  fecha_publicacion?: Date;

  @Prop({ required: false, default: false })
  completado?: boolean;

  @Prop({ required: false })
  tiempo_estimado?: string;

  @Prop({ required: false })
  video_id?: string;
}

export const ContenidoSchema = SchemaFactory.createForClass(Contenido);