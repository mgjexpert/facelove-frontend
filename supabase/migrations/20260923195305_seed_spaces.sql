-- Editorial drafts and empty public media slots. Identity ownership is assigned only after verification.
insert into public.profiles (username,display_name,bio) values
  ('anaoliveira','Ana Oliveira','Um espaço para partilhar momentos, pequenas histórias e o que me inspira. · Texto provisório'),
  ('emily','Emily','Fotografias, vídeos e histórias em capítulos. · Texto provisório'),
  ('jade','Jade','Um olhar pessoal sobre os dias, lugares e ideias que guardo. · Texto provisório'),
  ('micaelagomes','Micaela Gomes','Um espaço meu para partilhar novas coleções e vídeos. · Texto provisório'),
  ('evamartinez','Eva Martinez','Histórias visuais, novos lugares e pequenas descobertas. · Texto provisório');

insert into public.spaces (profile_id,title,status)
select id,display_name || ' · Space','published' from public.profiles
where username in ('anaoliveira','emily','jade','micaelagomes','evamartinez');

insert into public.albums (space_id,title,description,media_type,sort_order)
select s.id, a.title, a.description, a.media_type, a.sort_order
from public.spaces s join public.profiles p on p.id = s.profile_id
cross join lateral (values
  ('Fotografias · Álbum 1','Primeira coleção privada de fotografias.','image',1),
  ('Vídeos · Álbum 1','Primeira coleção privada de vídeos.','video',2)
) as a(title,description,media_type,sort_order)
where p.username in ('anaoliveira','emily','jade','micaelagomes','evamartinez');

insert into public.albums (space_id,title,description,media_type,sort_order)
select s.id,'Vídeos · Coleção especial','Coleção de acesso concedido manualmente, sem cobrança automática.','video',3
from public.spaces s join public.profiles p on p.id = s.profile_id where p.username = 'micaelagomes';

-- Each profile starts with editable public copy; no private image/video is published here.
insert into public.posts (space_id,caption,visibility,status,published_at)
select s.id,
  case p.username
    when 'anaoliveira' then 'Bem-vindos ao meu Space. Este texto é um rascunho para apresentar novidades e coleções.'
    when 'emily' then 'Bem-vindos! Em breve partilho novidades e primeiras fotografias por aqui.'
    when 'jade' then 'Um lugar para reunir os momentos que quero partilhar. Em breve, mais novidades.'
    when 'micaelagomes' then 'Olá! Estou a preparar novas coleções e conteúdos para este Space.'
    else 'Bem-vindos ao meu Space. Estou a preparar as primeiras publicações.'
  end,'public','published',now()
from public.spaces s join public.profiles p on p.id = s.profile_id
where p.username in ('anaoliveira','emily','jade','micaelagomes','evamartinez');
